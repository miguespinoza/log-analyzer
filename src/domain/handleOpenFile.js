import { fileLoadingSubject, projectFileLoadingSubject } from "./file-handling";

if ("launchQueue" in window) {
  console.log("File handling API is supported!");

  // eslint-disable-next-line no-undef
  launchQueue.setConsumer((launchParams) => {
    // Nothing to do when the queue is empty.
    if (!launchParams.files.length) {
      return;
    }
    // Handle the first file only.
    handleFileFromFileHandlingAPI(launchParams.files[0]);
  });
} else {
  console.error("File handling API is not supported!");
}

async function handleFileFromFileHandlingAPI(fileHandle) {
  console.log(`Opening ${fileHandle.name}`);
  // get file name extension
  const fileExtension = fileHandle.name.split(".").pop();

  const blob = await fileHandle.getFile();
  blob.handle = fileHandle;

  const contents = await blob.text();
  const fileProcessor = getFileProcessor(fileExtension);
  await fileProcessor(contents, fileHandle.name, fileHandle);
}

function getFileProcessor(fileExtension) {
  console.log("getFileProcessor", fileExtension);
  switch (fileExtension) {
    case ".tat":
      console.log("getFileProcessor addProjectFile");
      return addProjectFile;
    default:
      console.log("getFileProcessor addProjectFile");
      return addLogFile;
  }
}

function addProjectFile(contents, name) {
  const file = {
    name: name,
    content: contents,
  };
  fileLoadingSubject.next(file);
}

function addLogFile(contents, name, handle) {
  const file = {
    name: name,
    content: contents,
    fileHandle: handle,
  };
  projectFileLoadingSubject.next(file);
}
