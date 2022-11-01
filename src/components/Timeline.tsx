import { BarsArrowUpIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getRelativeTimePx, TimelineDomain } from "../domain/timeline";
import { getDateStringAtTz } from "../domain/timezone";
import { IconButton } from "./IconButton";

export function Timeline({
  firstLineVisibleIndex,
  lastLineVisibleIndex,
  height,
  width,
}: {
  firstLineVisibleIndex: number;
  lastLineVisibleIndex: number;
  height: number;
  width: number;
}) {
  const { lines, allLines } = useLogLinesContext();
  const { project } = useProjectFileContext();
  const firstDate = allLines[0]?.date;
  const lastDate = allLines[allLines.length - 1]?.date;

  const firstLineVisible = lines[firstLineVisibleIndex]?.date;
  const lastLineVisible = lines[lastLineVisibleIndex]?.date;
  if (
    firstDate == null ||
    lastDate == null ||
    firstLineVisible == null ||
    lastLineVisible == null
  ) {
    return null;
  }
  console.log(
    getDateStringAtTz(firstDate, project.displayTimezone),
    getDateStringAtTz(lastDate, project.displayTimezone)
  );
  const timeLine = new TimelineDomain(firstDate, lastDate, height);
  const visibleWindow = timeLine.getVisibleWindow(
    firstLineVisible,
    lastLineVisible
  );

  return (
    <div style={{ width: `${width}px` }} className="border relative">
      {timeLine.getIntervals().map(({ date, relativePx }, i) => (
        <DateRenderer
          key={i}
          date={date}
          top={relativePx - 7}
          timezone={project.displayTimezone}
        />
      ))}
      <DateRenderer
        date={lastDate}
        top={getRelativeTimePx(firstDate, lastDate, lastDate, height) - 7}
        timezone={project.displayTimezone}
      />
      <div
        title="visible time window"
        data-testid="timeline-visible-window"
        style={{
          top: visibleWindow.start.relativePx,
          height: visibleWindow.height,
        }}
        className="absolute  w-full border bg-teal-200 opacity-50"
      ></div>
    </div>
  );
}

function DateRenderer({
  date,
  top,
  timezone,
}: {
  date: Date;
  top: number;
  timezone: number;
}) {
  return (
    <span
      style={{
        top: top,
      }}
      className="text-[0.6rem] absolute w-full noWrap"
    >
      {getDateStringAtTz(date, timezone)}
    </span>
  );
}

// scrolls the button vertically on the timeline with mouse drag
function DraggableButton({ onChange }: { onChange: (value: number) => void }) {
  const [position, setPosition] = useState(0);
  return (
    <IconButton
      className="absolute"
      style={{
        top: position,
      }}
      onDrag={(e) => {
        if (e.screenY !== 0) {
          setPosition(e.pageY);
          console.log("onDrag", e, position);
        }
      }}
      onDragEnd={(e) => {
        onChange(position);
      }}
      draggable={true}
      icon={<BarsArrowUpIcon className="h-5 w-5" />}
    />
  );
}
