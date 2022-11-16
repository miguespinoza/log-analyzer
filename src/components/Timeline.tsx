import { BarsArrowUpIcon } from "@heroicons/react/24/solid";
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { last } from "rxjs";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import {
  ActivityInterval,
  getDateFromRelativePx,
  getRelativeTimePx,
  TimeHighlight,
  TimelineService,
} from "../domain/timeline";
import { getDateStringAtTz } from "../domain/timezone";
import { LogLine } from "../domain/types";
import { IconButton } from "./IconButton";

import { TimeHighlightRenderer } from "./TimeHighlight";

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
  const { project, timeHighlights, setAddingTimeHighlightAt } =
    useProjectFileContext();

  const timeLineService = useMemo(
    () => new TimelineService(firstDate, lastDate, height),
    [firstDate, lastDate, height]
  );
  const { maxCount, intervals: activityIntervals } = useMemo(
    () => timeLineService.getActivityIntervals(lines, 200),
    [timeLineService, lines]
  );
  const visibleWindow = useMemo(
    () => timeLineService.getVisibleWindow(firstLineVisible, lastLineVisible),
    [timeLineService, firstLineVisible, lastLineVisible]
  );

  const onDoubleClick = useCallback(
    ({ pageY }: { pageY: number }) => {
      setAddingTimeHighlightAt(
        getDateFromRelativePx(firstDate, lastDate, pageY, height)
      );
    },
    [setAddingTimeHighlightAt, firstDate, lastDate, height]
  );

  return (
    <div
      style={{ width: `${width}px` }}
      className="border relative"
      onDoubleClick={onDoubleClick}
    >
      <TimelineDats
        timeLineService={timeLineService}
        timezoneOffset={project.displayTimezone}
      />
      <ActivityIntervals
        activityIntervals={activityIntervals}
        maxCount={maxCount}
        height={height}
        width={width}
        timezoneOffset={project.displayTimezone}
      />
      <DateRenderer
        date={lastDate}
        top={getRelativeTimePx(firstDate, lastDate, lastDate, height) - 14}
        timezone={project.displayTimezone}
      />
      <TimelineHighlights
        timeHighlights={timeHighlights}
        firstDate={firstDate}
        lastDate={lastDate}
        height={height}
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

const TimelineDats = memo(
  ({
    timeLineService,
    timezoneOffset,
  }: {
    timeLineService: TimelineService;
    timezoneOffset: number;
  }) => {
    return (
      <>
        {timeLineService.getIntervals().map(({ date, relativePx }, i) => (
          <DateRenderer
            key={i}
            date={date}
            top={Math.max(0, relativePx - 14)}
            timezone={timezoneOffset}
          />
        ))}
      </>
    );
  }
);

const TimelineHighlights = memo(
  ({
    timeHighlights,
    firstDate,
    lastDate,
    height,
  }: {
    timeHighlights: TimeHighlight[];
    firstDate: Date;
    lastDate: Date;
    height: number;
  }) => {
    const { removeTimeHighlight } = useProjectFileContext();

    const onDoubleClickHandler = useCallback(
      (h: TimeHighlight) => {
        removeTimeHighlight(h);
      },
      [removeTimeHighlight]
    );
    return (
      <>
        {timeHighlights.map((h) => (
          <TimeHighlightRenderer
            key={h.id}
            containerEndDate={lastDate}
            containerStartDate={firstDate}
            containerHeight={height}
            highlight={h}
            onDoubleClick={onDoubleClickHandler}
          />
        ))}
      </>
    );
  }
);

const ActivityIntervals = memo(
  ({
    activityIntervals,
    width,
    height,
    maxCount,
    timezoneOffset,
  }: {
    activityIntervals: ActivityInterval[];
    maxCount: number;
    height: number;
    width: number;
    timezoneOffset: number;
  }) => {
    return (
      <>
        {activityIntervals.map((interval, i) => (
          <ActivityIntervalBar
            key={interval.id}
            interval={interval}
            maxCount={maxCount}
            maxHeight={height}
            maxWidth={width}
            numberOfIntervals={activityIntervals.length}
            timezoneOffset={timezoneOffset}
          />
        ))}
      </>
    );
  }
);
ActivityIntervals.displayName = "ActivityIntervals";

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
  const date = useMemo(
    () => getDateStringAtTz(interval.start, timezoneOffset),
    [interval.start, timezoneOffset]
  );
  return (
    <div
      data-testid="timeline-activity-interval"
      title={date}
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

const DateRenderer = memo(
  ({ date, top, timezone }: { date: Date; top: number; timezone: number }) => {
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
);
DateRenderer.displayName = "DateRenderer";

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
