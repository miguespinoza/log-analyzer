import React from "react";
import { makeDragLogFileImportReactive } from "../domain/file-handling";

export default function DropFileZone({
  children,
}: {
  children: React.ReactNode;
}) {
  const handler = makeDragLogFileImportReactive();
  return (
    <div
      id="file_drop"
      onDrop={handler}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
    >
      {children}
    </div>
  );
}
