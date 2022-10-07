import React, { useCallback } from "react";
import {
  downloadFile,
  handleFileSystemHandle,
  isFileSystemAPIAvailable,
  makeHTMLFileInputHandler,
  saveFile,
  saveFileAs,
  showOpenFilePicker,
} from "../domain/file-handling";
import {
  adaptFiltersToXML,
  extractFiltersFromXML,
} from "../domain/tat-xml-files";
import { Button } from "./Button";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { LabeledTextField } from "./LabeledTextField";
import { useLogLinesContext } from "../context/LogLinesContext";
import { Filter } from "../domain/types";

export default function ManageTaTFilters({
  projectName,
}: {
  projectName: string;
}) {
  const { setFilters, filters } = useLogLinesContext();
  const { filtersFile, setFiltersFile } = useProjectFileContext();

  const onSaveFilters = () => {
    const xml = adaptFiltersToXML(filters);
    if (isFileSystemAPIAvailable()) {
      console.log("trying to save file", filtersFile);
      if (filtersFile) {
        saveFile(filtersFile, xml);
      } else {
        saveFileAs(`${projectName}.tat`, xml);
      }
    } else {
      downloadFile(`${projectName}.tat`, xml, "text/xml");
    }
  };

  const onSaveAsFilters = () => {
    const xml = adaptFiltersToXML(filters);
    if (isFileSystemAPIAvailable()) {
      console.log("trying to save file", filtersFile);
      saveFileAs(`${projectName}.tat`, xml);
    } else {
      downloadFile(`${projectName}.tat`, xml, "text/xml");
    }
  };

  return (
    <div>
      <span>{filtersFile?.name}</span>
      <div className="flex justify-between">
        <OpenFiltersFile
          onLoad={(filters, handle) => {
            setFilters(filters);
            if (handle) {
              setFiltersFile(handle);
            }
          }}
        />
        {isFileSystemAPIAvailable() && filtersFile == null && (
          <Button onClick={onSaveFilters}>
            {isFileSystemAPIAvailable() ? "Save Filters" : "Download filters"}
          </Button>
        )}
        <Button onClick={onSaveAsFilters}>
          {isFileSystemAPIAvailable() ? "Save As Filters" : "Download filters"}
        </Button>
      </div>
    </div>
  );
}

function OpenFiltersFile({
  onLoad,
}: {
  onLoad: (filters: Filter[], handle?: FileSystemFileHandle) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  if (isFileSystemAPIAvailable()) {
    return <OpenFiltersFileV2 onLoad={onLoad} />;
  }

  const handle = makeHTMLFileInputHandler((xmlFile) => {
    const { filters, errors } = extractFiltersFromXML(xmlFile.content);
    if (errors.length > 0) {
      console.error(errors);
    } else {
      onLoad(filters);
      ref.current?.value && (ref.current.value = "");
    }
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

function OpenFiltersFileV2({
  onLoad,
}: {
  onLoad: (filters: Filter[], handle?: FileSystemFileHandle) => void;
}) {
  const onClick = useCallback(() => {
    showOpenFilePicker().then(async (handles: FileSystemFileHandle[]) => {
      const files = await Promise.all(handles.map(handleFileSystemHandle));
      const file = files[0];
      if (file) {
        const { filters } = extractFiltersFromXML(file.content);
        onLoad(filters, file.fileHandle);
      }
    });
  }, [onLoad]);

  return <Button onClick={onClick}>Load Filters</Button>;
}
