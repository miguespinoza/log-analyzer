import { ChangeEvent, ChangeEventHandler } from "react";
import { LogFile } from "../components/LogFilesContext";
import { parseLogFile } from "./log-lines-domain";
import { map, ReplaySubject } from "rxjs";
type TextFile = {
  name: string;
  content: string;
};

export const fileLoadingSubject = new ReplaySubject<TextFile>(100, 10000);
export const fileLoading$ = fileLoadingSubject
  .asObservable()
  .pipe(map(preProcessLogFile));


export function makeHandleHTMLFileInputReactive() {
  return makeHTMLFileInputHandler((file) => fileLoadingSubject.next(file));
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

export function makeDragLogFileImportReactive() {
  return makeDragFileInputHandler((file) => fileLoadingSubject.next(file));
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

export function preProcessLogFile(file: TextFile): LogFile {
  const color = getFileColor();
  const { lines, linesWithoutDateCount } = parseLogFile(
    file.content,
    file.name,
    color
  );
  return {
    name: file.name,
    text: file.content,
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
