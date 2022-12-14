// Component that has a file input and returns the text of the file

import React, { useEffect, useState } from "react";
import {
  makeHandleHTMLFileInputReactive,
  onLogFilePickerClick,
  openLogFolderPicker,
} from "../domain/file-handling";
import { useLogLinesContext } from "../context/LogLinesContext";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useFilesContext } from "../context/FileContext";
import { LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import useDebouncedCallback from "../domain/useDebouncedCallback";
import { ILogFile } from "../domain/types";
const fileNameLength = 60;
const getFileName = (name: string) => {
  if (name.length > fileNameLength) {
    return name.slice(0, fileNameLength) + "...";
  }
  return name;
};

// file picker that uses the file system access aPI https://web.dev/file-system-access/
export function OpenFilesV2() {
  return (
    <div className="flex gap-1 items-center">
      <Button look="secondary" onClick={openLogFolderPicker}>
        Open Log Folder
      </Button>
      <Button onClick={onLogFilePickerClick}>Open Files</Button>
    </div>
  );
}

export function OpenFilesInput() {
  if ("showOpenFilePicker" in window) {
    return <OpenFilesV2 />;
  }
  const handler = makeHandleHTMLFileInputReactive();
  return (
    <LabeledTextField
      label="Open files"
      inputProps={{
        type: "file",
        multiple: true,
        onChange: handler,
      }}
    />
  );
}

function UpdateTimezoneInput({ file }: { file: ILogFile }) {
  const { updateFileTimezone } = useLogLinesContext();
  const [timezone, setTimezone] = useState(file.timezone);

  const updateFileTimezoneDebounced = useDebouncedCallback(
    updateFileTimezone as any,
    500
  );

  useEffect(() => {
    if (timezone !== file.timezone) {
      updateFileTimezoneDebounced(file, timezone);
    }
  }, [timezone, file, updateFileTimezoneDebounced]);

  return !file.getHasTimezoneInfo() ? (
    <LabeledTextField
      label="TZ"
      inputProps={{
        title: "The file does not have timezone information, please provide it",
        type: "number",
        value: timezone,
        onChange: (e) => {
          const newTimezone = parseInt(e.target.value);
          if (!isNaN(newTimezone)) {
            setTimezone(newTimezone);
          } else {
            console.error("cannot parse int", e.target.value);
          }
        },
        min: -12,
        max: 12,
        className: "p-0 w-[2rem]",
      }}
    />
  ) : null;
}

export default function LoadFiles() {
  const { logFiles, updateLogFile } = useLogLinesContext();
  const { removeLogFile } = useFilesContext();

  return (
    <div className="files border-l dark:border-cyan-800 overflow-auto basis-1/3">
      {logFiles.map((file) => (
        <div key={file.name} className="overflow-auto w-full">
          <div style={{ backgroundColor: file.color }} className="flex gap-1">
            <span className=" flex items-center justify-center p-1 gap-1">
              <input
                type="checkbox"
                checked={file.isVisible}
                onChange={(e) => {
                  const newFile = { ...file, isVisible: e.target.checked };
                  updateLogFile(newFile);
                }}
              />
              <UpdateTimezoneInput file={file} />
              {file.getLinesWithoutDateCount() != null &&
                (file.getLinesWithoutDateCount() as number) > 0 && (
                  <span
                    title={`${file.getLinesWithoutDateCount()} lines without date, to see them switch to sort by file`}
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                  </span>
                )}
            </span>
            <span
              className="noWrap align-text-top w-full px-2"
              title={file.name}
            >
              {getFileName(file.name)}
            </span>
            <button
              type="button"
              title="close"
              onClick={() => removeLogFile(file)}
            >
              <XMarkIcon className="h-6 w-6 text-black" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
