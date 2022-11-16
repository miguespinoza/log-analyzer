import { LogLine } from "./types";
import { v4 as uuid } from "uuid";

export function getRelativeTimePx(
  startDate: Date,
  endDate: Date,
  timestamp: Date,
  height: number
) {
  const totalMs = endDate.getTime() - startDate.getTime();
  const relativeMs = timestamp.getTime() - startDate.getTime();
  return Math.floor((relativeMs / totalMs) * height);
}

export function getDateFromRelativePx(
  startDate: Date,
  endDate: Date,
  relativePx: number,
  height: number
) {
  const totalMs = endDate.getTime() - startDate.getTime();
  const relativeMs = (relativePx / height) * totalMs;
  return new Date(startDate.getTime() + relativeMs);
}

export function getTimelineVisibleWindow(
  startDate: Date,
  endDate: Date,
  height: number,
  firstLineVisibleDate: Date,
  lastLineVisibleDate: Date
): [number, number] {
  return [
    getRelativeTimePx(startDate, endDate, firstLineVisibleDate, height),
    getRelativeTimePx(startDate, endDate, lastLineVisibleDate, height),
  ];
}

type TimelineRepresntation = {
  date: Date;
  relativePx: number;
};

interface ITimeline {
  getIntervals: (steps?: number) => TimelineRepresntation[];
  getVisibleWindow: (
    firstLineVisibleDate: Date,
    lastLineVisibleDate: Date
  ) => {
    start: TimelineRepresntation;
    end: TimelineRepresntation;
    height: number;
  };
}
export type ActivityInterval = {
  id: string;
  start: Date;
  end: Date;
  relativePx: number;
  linesCount: number;
};

export class TimeHighlight {
  constructor(
    public id: string,
    public date: Date,
    public label: string,
    public color: string
  ) {}
}

export function getTimeHighlightPosition(
  date: Date,
  start: Date,
  end: Date,
  containerHeight: number
) {
  return getRelativeTimePx(start, end, date, containerHeight);
}

export class TimelineService implements ITimeline {
  private startDate: Date;
  private endDate: Date;
  private height: number;
  constructor(startDate: Date, endDate: Date, height: number) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.height = height;
  }

  getIntervals(steps = 10) {
    const dateIntervals = Array.from({ length: steps }, (_, i) => {
      const date = new Date(
        this.startDate.getTime() +
          (this.endDate.getTime() - this.startDate.getTime()) * (i / steps)
      );
      return date;
    });

    return dateIntervals.map((date) => ({
      date: date,
      relativePx: getRelativeTimePx(
        this.startDate,
        this.endDate,
        date,
        this.height
      ),
    }));
  }

  getActivityIntervals(
    lines: LogLine[],
    steps: number = 10
  ): { maxCount: number; intervals: ActivityInterval[] } {
    const oldestDate =
      this.startDate.getTime() > this.endDate.getTime()
        ? this.startDate
        : this.endDate;

    const earliestDate =
      this.startDate.getTime() > this.endDate.getTime()
        ? this.endDate
        : this.startDate;
    const totalTime = Math.abs(oldestDate.getTime() - earliestDate.getTime());
    const stepSizeMs = totalTime / steps;
    const dateIntervals = Array.from({ length: steps }, (_, i) => {
      const date = new Date(
        earliestDate.getTime() +
          (oldestDate.getTime() - earliestDate.getTime()) * (i / steps)
      );
      return date;
    });

    const activityIntervals = dateIntervals.map((date) => {
      const relativePx = getRelativeTimePx(
        this.startDate,
        this.endDate,
        date,
        this.height
      );
      const linesCount = 0;
      return {
        start: date,
        end: new Date(date.getTime() + stepSizeMs),
        relativePx,
        linesCount,
        id: uuid(),
      };
    });

    const rererenceDate = activityIntervals[0].start;
    const intervalSize = stepSizeMs;
    let max = 0;
    lines.forEach((line) => {
      if (line.date) {
        const lineTime = line.date.getTime();
        const relativeTime = Math.max(0, lineTime - rererenceDate.getTime());

        const intervalIndex = Math.max(
          Math.min(
            activityIntervals.length - 1,
            Math.floor(relativeTime / intervalSize)
          ),
          0
        );

        activityIntervals[intervalIndex].linesCount++;
        if (activityIntervals[intervalIndex].linesCount > max) {
          max = activityIntervals[intervalIndex].linesCount;
        }
      }
    });

    return { maxCount: max, intervals: activityIntervals };
  }

  getVisibleWindow(firstLineVisibleDate: Date, lastLineVisibleDate: Date) {
    const dateIntervals = getTimelineVisibleWindow(
      this.startDate,
      this.endDate,
      this.height,
      firstLineVisibleDate,
      lastLineVisibleDate
    );

    return {
      start: {
        date: firstLineVisibleDate,
        relativePx: dateIntervals[0],
      },
      end: {
        date: lastLineVisibleDate,
        relativePx: dateIntervals[1],
      },
      height: dateIntervals[1] - dateIntervals[0],
    };
  }
}
