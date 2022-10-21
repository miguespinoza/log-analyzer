import clsx from "clsx";
import React from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getDateStringAtTz } from "../domain/timezone";

export default function StatusBar() {
  const { project } = useProjectFileContext();

  const sortDirection = project.sortDirection;
  const { lines } = useLogLinesContext();

  const earliestDate =
    sortDirection === "asc" ? lines[0]?.date : lines[lines.length - 1]?.date;
  const latestDate =
    sortDirection === "asc" ? lines[lines.length - 1]?.date : lines[0]?.date;

  return (
    <div
      className={clsx(
        "statusBar w-full p-1 flex justify-between gap-2 ",
        "bg-gray-300 dark:bg-gray-700"
      )}
    >
      <span>Total lines: {lines.length}</span>
      <div className="flex gap-3">
        <span>
          Earliest Date:{" "}
          {earliestDate
            ? getDateStringAtTz(earliestDate, project.displayTimezone)
            : "N/A"}
        </span>
        <span>
          Latest Date:{" "}
          {latestDate
            ? getDateStringAtTz(latestDate, project.displayTimezone)
            : "N/A"}
        </span>
      </div>
    </div>
  );
}
