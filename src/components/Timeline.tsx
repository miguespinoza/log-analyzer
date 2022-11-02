import { BarsArrowUpIcon } from "@heroicons/react/24/solid";
import React, { useMemo, useState } from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getRelativeTimePx, TimelineDomain } from "../domain/timeline";
import { getDateStringAtTz } from "../domain/timezone";
import { LogLine } from "../domain/types";
import { IconButton } from "./IconButton";

function getValidDateFromEndOfArray(lines: LogLine[]): Date | undefined {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.date && !isNaN(line.date.getTime())) {
      return line.date;
    }
  }
}

function getValidDateFromStart(lines: LogLine[]): Date | undefined {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.date && !isNaN(line.date.getTime())) {
      return line.date;
    }
  }
}

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
  const firstDate = getValidDateFromStart(allLines);
  const lastDate = getValidDateFromEndOfArray(allLines);
  const firstLineVisible = lines[firstLineVisibleIndex]?.date;
  const lastLineVisible = lines[lastLineVisibleIndex]?.date;
  if (
    firstLineVisible == null ||
    lastLineVisible == null ||
    firstDate == null ||
    lastDate == null
  ) {
    return null;
  }
  return (
    <TimelineInternal
      firstLineVisible={firstLineVisible}
      lastLineVisible={lastLineVisible}
      height={height}
      width={width}
      firstDate={firstDate}
      lastDate={lastDate}
    />
  );
}

function TimelineInternal({
  firstLineVisible,
  lastLineVisible,
  height,
  width,
  firstDate,
  lastDate,
}: {
  firstLineVisible: Date;
  lastLineVisible: Date;
  firstDate: Date;
  lastDate: Date;
  height: number;
  width: number;
}) {
  const { lines } = useLogLinesContext();
  const { project } = useProjectFileContext();

  const timeLine = useMemo(
    () => new TimelineDomain(firstDate, lastDate, height),
    [firstDate, lastDate, height]
  );
  const { maxCount, intervals: activityIntervals } = useMemo(
    () => timeLine.getActivityIntervals(lines, 100),
    [timeLine, lines]
  );

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
      {activityIntervals.map((interval) => (
        <div
          title={getDateStringAtTz(interval.start, project.displayTimezone)}
          style={{
            left: 0,
            top: `${interval.relativePx}px`,
            height: `${height / activityIntervals.length}px`,
            width: `${(width * interval.linesCount) / maxCount}px`,
          }}
          className="absolute opacity-50 bg-gray-500"
        ></div>
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