import { fileLoadingSubject } from "./file-handling";

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

  const blob = await fileHandle.getFile();
  blob.handle = fileHandle;

  const contents = await blob.text();

  await addFile(contents, fileHandle.name);
}

function addFile(contents, name) {
  const file = {
    name: name,
    content: contents,
  };
  fileLoadingSubject.next(file);
}
