import { ChangeEvent, ChangeEventHandler } from "react";
import { LogFile } from "../components/LogFilesContext";
import { parseLogFile } from "./log-lines-domain";
import { map, ReplaySubject } from "rxjs";
interface TextFile {
  name: string;
  content: string;
}

interface TextFilev2 extends TextFile {
  fileHandle: FileSystemFileHandle;
}

async function getSaveFileHandle(options?: any) {
  const handle = await (window as any).showSaveFilePicker(options);
  return handle;
}

export async function saveFileAs(sugestedName: string, contents: string) {
  const handle = await getSaveFileHandle({
    suggestedName: sugestedName,
  });
  await saveFile(handle, contents);
}

export async function saveFile(handle: FileSystemFileHandle, contents: string) {
  try {
    const writable = await (handle as any).createWritable();
    await writable.write(contents).then(console.log);
    await writable.close();
  } catch (e) {
    console.error(e);
  }
}

export function downloadFile(
  name: string,
  contents: string,
  type: string = "text/plain"
) {
  const blob = new Blob([contents], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}

export const fileLoadingSubject = new ReplaySubject<TextFilev2>(100, 10000);
export const fileLoading$ = fileLoadingSubject
  .asObservable()
  .pipe(map(preProcessLogFile));

export function makeHandleHTMLFileInputReactive() {
  return makeHTMLFileInputHandler((file) =>
    fileLoadingSubject.next(adaptFileToFilev2(file))
  );
}

function adaptFileToFilev2(file: TextFile): TextFilev2 {
  return { ...file, fileHandle: undefined as any };
}

export const makeHTMLFileInputHandler: (
  onFileLoaded: (file: TextFile) => void
) => ChangeEventHandler<HTMLInputElement> = (onFileLoaded) => {
  return (evt: ChangeEvent<HTMLInputElement>) => {
    const files = (evt.target as HTMLInputElement).files;
    if (files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text =
            (e.target?.result as string) ?? "Error while reading file";

          onFileLoaded({ name: file.name, content: text });
        };
        reader.readAsText(file);
      }
    }
  };
};

export function isFileSystemAPIAvailable(): boolean {
  return "showOpenFilePicker" in window;
}

export async function onLogFilePickerClick() {
  showOpenFilePicker({
    multiple: true,
  }).then(async (handles: FileSystemFileHandle[]) => {
    window.localStorage.setItem("test", handles.toString());
    const files = await Promise.all(handles.map(handleFileSystemHandle));
    files.forEach((f) => {
      fileLoadingSubject.next(f);
    });
  });
}

export async function handleFileSystemHandle(
  fileHandle: FileSystemFileHandle
): Promise<TextFilev2> {
  const fileObj = await fileHandle.getFile();
  const contents = await fileObj.text();
  return {
    fileHandle,
    name: fileHandle.name,
    content: contents,
  };
}

export function makeDragLogFileImportReactive() {
  return makeDragFileInputHandler((file) =>
    fileLoadingSubject.next(adaptFileToFilev2(file))
  );
}

export function showOpenFilePicker(options?: any) {
  return (window as any).showOpenFilePicker(options);
}

export const makeDragFileInputHandler: (
  onFileLoaded: (file: TextFile) => void
) => (evt: React.DragEvent<HTMLDivElement>) => void = (onFileLoaded) => {
  return (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    const items = evt.dataTransfer.items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text =
              (e.target?.result as string) ?? "Error while reading file";

            onFileLoaded({ name: file.name, content: text });
          };
          reader.readAsText(file);
        } else {
          console.log("file is null");
        }
      }
    }
  };
};

export function preProcessLogFile(file: TextFilev2): LogFile {
  const color = getFileColor();
  const { lines, linesWithoutDateCount } = parseLogFile(
    file.content,
    file.name,
    color
  );
  return {
    name: file.name,
    text: file.content,
    fileHandle: file.fileHandle,
    lines,
    linesWithoutDateCount,
    color,
    timezone: 0,
    isVisible: true,
  };
}

export function getFileColor() {
  // array of pastel colors
  const colors = [
    "#836953",
    "#b2fba5",
    "#89cff0",
    "#fdfd96",
    "#ff694f",
    "#ff9899",
    "#ffb7ce",
    "#ca9bf7",
    "#77dd77",
    "#836953",
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00ff00",
    "#0000ff",
    "#4b0082",
    "#9400d3",
  ];

  // get random color
  return colors[Math.floor(Math.random() * colors.length)];
}
