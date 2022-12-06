import clsx from "clsx";
import React, { forwardRef, useState } from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getDateStringAtTz } from "../domain/timezone";
import { FeedbackFormModal } from "./FeedbackForm";

export const StatusBar = forwardRef<HTMLDivElement>((props, ref) => {
  const { project } = useProjectFileContext();

  const sortDirection = project.sortDirection;
  const { lines } = useLogLinesContext();

  const [isFilingFeedback, setIsFilingFeedback] = useState(false);

  const earliestDate =
    sortDirection === "asc" ? lines[0]?.date : lines[lines.length - 1]?.date;
  const latestDate =
    sortDirection === "asc" ? lines[lines.length - 1]?.date : lines[0]?.date;

  return (
    <div
      ref={ref}
      test-id="statusbar"
      className={clsx(
        "sticky bottom-0",
        "w-full p-1 flex justify-between gap-2 ",
        "bg-gray-300 dark:bg-gray-700"
      )}
    >
      <span>Total lines: {lines.length}</span>
      <button onClick={() => setIsFilingFeedback(true)}>
        Provide feedback
      </button>
      <FeedbackFormModal
        showModal={isFilingFeedback}
        setShowModal={setIsFilingFeedback}
        forwardProps={{
          onComplete: () => {
            setIsFilingFeedback(false);
          },
        }}
      ></FeedbackFormModal>
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
});
StatusBar.displayName = "StatusBar";
