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
    getRelativeTimePx(startDate, endDate, firstLineVisibleDate as Date, height),
    getRelativeTimePx(startDate, endDate, lastLineVisibleDate as Date, height),
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

export class TimelineDomain implements ITimeline {
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
