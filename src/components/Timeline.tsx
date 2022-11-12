import { BarsArrowUpIcon } from "@heroicons/react/24/solid";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import {
  ActivityInterval,
  getRelativeTimePx,
  TimelineService,
} from "../domain/timeline";
import { getDateStringAtTz } from "../domain/timezone";
import { LogLine } from "../domain/types";
import { IconButton } from "./IconButton";

import { TimeHighlightFormModal, TimeHighlightRenderer } from "./TimeHighlight";

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
  updateVisivility,
}: {
  firstLineVisibleIndex: number;
  lastLineVisibleIndex: number;
  height: number;
  width: number;
  updateVisivility: (didShow: boolean) => void;
}) {
  const { lines, allLines } = useLogLinesContext();
  const firstDate = getValidDateFromStart(allLines);
  const lastDate = getValidDateFromEndOfArray(allLines);
  const firstLineVisible = lines[firstLineVisibleIndex]?.date;
  const lastLineVisible = lines[lastLineVisibleIndex]?.date;
  const { project } = useProjectFileContext();
  const timeLineWillHide =
    firstLineVisible == null ||
    lastLineVisible == null ||
    firstDate == null ||
    project.sortBy === "file" ||
    lastDate == null;
  useLayoutEffect(() => {
    updateVisivility(!timeLineWillHide);
  });

  if (timeLineWillHide) {
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
  const { project, timeHighlights, addTimeHighlight, removeTimeHighlight } =
    useProjectFileContext();

  const timeLineService = useMemo(
    () => new TimelineService(firstDate, lastDate, height),
    [firstDate, lastDate, height]
  );
  const { maxCount, intervals: activityIntervals } = useMemo(
    () => timeLineService.getActivityIntervals(lines, 100),
    [timeLineService, lines]
  );
  const visibleWindow = timeLineService.getVisibleWindow(
    firstLineVisible,
    lastLineVisible
  );

  const [creatingNewHighlight, setCreatingNewHighlight] = useState<
    number | null
  >(null);

  return (
    <div
      style={{ width: `${width}px` }}
      className="border relative"
      onDoubleClick={({ pageY }) => {
        setCreatingNewHighlight(pageY);
      }}
    >
      {timeLineService.getIntervals().map(({ date, relativePx }, i) => (
        <DateRenderer
          key={i}
          date={date}
          top={Math.max(0, relativePx - 14)}
          timezone={project.displayTimezone}
        />
      ))}
      {activityIntervals.map((interval, i) => (
        <ActivityIntervalBar
          key={interval.id}
          interval={interval}
          maxCount={maxCount}
          maxHeight={height}
          maxWidth={width}
          numberOfIntervals={activityIntervals.length}
          timezoneOffset={project.displayTimezone}
        />
      ))}
      <DateRenderer
        date={lastDate}
        top={getRelativeTimePx(firstDate, lastDate, lastDate, height) - 14}
        timezone={project.displayTimezone}
      />
      {timeHighlights.map((h) => (
        <TimeHighlightRenderer
          key={h.id}
          highlight={h}
          onDoubleClick={() => {
            removeTimeHighlight(h);
          }}
        />
      ))}
      <div
        title="visible time window"
        data-testid="timeline-visible-window"
        style={{
          top: visibleWindow.start.relativePx,
          height: visibleWindow.height,
        }}
        className="absolute  w-full border bg-teal-200 opacity-50"
      ></div>
      <TimeHighlightFormModal
        showModal={creatingNewHighlight != null}
        setShowModal={() => setCreatingNewHighlight(null)}
        forwardProps={{
          addHighlight: (h) => {
            addTimeHighlight(h);
            setCreatingNewHighlight(null);
          },
          relativePixel: creatingNewHighlight as number,
          timelineService: timeLineService,
        }}
      />
    </div>
  );
}

function ActivityIntervalBar({
  interval,
  timezoneOffset,
  maxCount,
  maxHeight,
  maxWidth,
  numberOfIntervals,
}: {
  maxWidth: number;
  maxHeight: number;
  maxCount: number;
  numberOfIntervals: number;
  interval: ActivityInterval;
  timezoneOffset: number;
}) {
  const height = maxHeight / numberOfIntervals;
  return (
    <div
      data-testid="timeline-activity-interval"
      title={getDateStringAtTz(interval.start, timezoneOffset)}
      style={{
        left: 0,
        top: `${interval.relativePx - height}px`,
        height: `${height}px`,
        width: `${(maxWidth * interval.linesCount) / maxCount}px`,
      }}
      className="absolute opacity-50 bg-gray-500"
    ></div>
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
