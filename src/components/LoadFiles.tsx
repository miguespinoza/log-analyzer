// Component that has a file input and returns the text of the file

import React, { useState } from "react";
import {
  makeHandleHTMLFileInputReactive,
  onLogFilePickerClick,
} from "../domain/file-handling";
import { useLogLinesContext } from "../context/LogLinesContext";
import {
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useFilesContext } from "../context/FileContext";
import { LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import { withModal } from "./withModal";
import { LogFile } from "../domain/types";
const fileNameLength = 60;
const getFileName = (name: string) => {
  if (name.length > fileNameLength) {
    return name.slice(0, fileNameLength) + "...";
  }
  return name;
};

// file picker that uses the file system access aPI https://web.dev/file-system-access/
export function OpenFilesV2() {
  return <Button onClick={onLogFilePickerClick}>Open Files</Button>;
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

export default function LoadFiles() {
  const { logFiles, updateLogFile } = useLogLinesContext();
  const { removeLogFile } = useFilesContext();
  const [selectedFile, setSelectedFile] = useState<LogFile | null>(null);

  return (
    <div className="files border">
      {selectedFile != null && (
        <FileEditModal
          showModal={!!selectedFile}
          setShowModal={() => setSelectedFile(null)}
          forwardProps={{
            file: selectedFile,
          }}
        />
      )}
      <div
        style={{ maxHeight: "calc(15rem - 43px)" }}
        className="overflow-auto"
      >
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
                <span>TZ:</span>
                <input
                  title="Timezone offset in case the date in the log does not include it"
                  className="w-[2rem]"
                  type={"number"}
                  min={-12}
                  max={12}
                  value={file.timezone}
                  onChange={(e) => {
                    const newTimezone = parseInt(e.target.value);
                    if (!isNaN(newTimezone)) {
                      const newFile = { ...file, timezone: newTimezone };
                      updateLogFile(newFile);
                    } else {
                      console.error("cannot parse int", e.target.value);
                    }
                  }}
                />
                {file.linesWithoutDateCount > 0 && (
                  <span
                    title={`${file.linesWithoutDateCount} lines without date`}
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                  </span>
                )}
                <button
                  className="hover:bg-slate-400 p-1 rounded"
                  title="edit filter"
                  onClick={() => setSelectedFile(file)}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
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
    </div>
  );
}

const FileForm: React.FC<{ file: LogFile }> = ({ file }) => {
  const { updateLogFile } = useLogLinesContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const color = formData.get("color") as string;
        if (color != null && color !== file.color) {
          updateLogFile({ ...file, color });
        }
      }}
    >
      <div className="flex gap-1">
        <LabeledTextField
          label="Color"
          inputProps={{
            type: "color",
            name: "color",
            style: { padding: 0 },
            defaultValue: file.color,
          }}
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
};

const FileEditModal = withModal(FileForm);