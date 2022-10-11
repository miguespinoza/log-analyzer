import React, { useCallback } from "react";
import {
  adaptFileToFilev2,
  handleFileSystemHandle,
  isFileSystemAPIAvailable,
  makeHTMLFileInputHandler,
  showOpenFilePicker,
  TextFilev2,
} from "../domain/file-handling";
import { Button } from "./Button";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { LabeledTextField } from "./LabeledTextField";

export default function ManageTaTFilters() {
  const { filtersFile, saveProjectFile, saveProjectFileAs, openProjectFile } =
    useProjectFileContext();

  return (
    <div>
      <span>{filtersFile?.name}</span>
      <div className="flex justify-between">
        <OpenFiltersFile
          onLoad={(file) => {
            openProjectFile(file);
          }}
        />
        {isFileSystemAPIAvailable() && (
          <Button onClick={saveProjectFile}>
            {isFileSystemAPIAvailable() ? "Save Filters" : "Download filters"}
          </Button>
        )}
        <Button onClick={saveProjectFileAs}>
          {isFileSystemAPIAvailable() ? "Save As Filters" : "Download filters"}
        </Button>
      </div>
    </div>
  );
}

function OpenFiltersFile({ onLoad }: { onLoad: (file: TextFilev2) => void }) {
  const ref = React.useRef<HTMLInputElement>(null);

  if (isFileSystemAPIAvailable()) {
    return <OpenFiltersFileV2 onLoad={onLoad} />;
  }

  const handle = makeHTMLFileInputHandler((xmlFile) => {
    onLoad(adaptFileToFilev2(xmlFile));
  });
  return (
    <LabeledTextField
      ref={ref}
      label="Load tat Filters"
      inputProps={{
        type: "file",
        onChange: handle,
      }}
    />
  );
}

function OpenFiltersFileV2({ onLoad }: { onLoad: (file: TextFilev2) => void }) {
  const onClick = useCallback(() => {
    showOpenFilePicker().then(async (handles: FileSystemFileHandle[]) => {
      const files = await Promise.all(handles.map(handleFileSystemHandle));
      const file = files[0];
      if (file) {
        onLoad(file);
      }
    });
  }, [onLoad]);

  return <Button onClick={onClick}>Load Filters</Button>;
}

