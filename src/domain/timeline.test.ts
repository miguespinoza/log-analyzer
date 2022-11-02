import { expect, test } from "vitest";
import {
  getDateFromRelativePx,
  getRelativeTimePx,
  TimelineDomain,
} from "./timeline";
import { LogLine } from "./types";

test("getRelativeTimePx", () => {
  const startDate = new Date(2021, 0, 1);
  const endDate = new Date(2021, 0, 2);
  const timestamp = new Date(2021, 0, 1, 1);
  const height = 100;

  const result = getRelativeTimePx(startDate, endDate, timestamp, height);

  expect(result).toBe(Math.floor(100 / 24));
});

test("getDateFromRelativePx", () => {
  const startDate = new Date(2021, 0, 1);
  const endDate = new Date(2021, 0, 2);
  const relativePx = 100 / 24;
  const height = 100;

  const result = getDateFromRelativePx(startDate, endDate, relativePx, height);

  expect(result).toEqual(new Date(2021, 0, 1, 1));
});

function makeMockLine(date: Date): LogLine {
  return {
    date,
    id: "id",
    fileId: "id",
    count: 0,
    hash: "stringNumber",
    fileName: "stringNumber",
    text: "stringNumber",
    textWithoutDate: "stringNumber",
    fileColor: "stringNumber",
  };
}

test("getActivityIntervals", () => {
  const lines = [
    makeMockLine(new Date(2021, 0, 1, 1)),
    makeMockLine(new Date(2021, 0, 1, 2)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 4)),
    makeMockLine(new Date(2021, 0, 1, 5)),
    makeMockLine(new Date(2021, 0, 1, 6)),
  ];

  const timeline = new TimelineDomain(
    new Date(2021, 0, 1, 1),
    new Date(2021, 0, 1, 6),
    100
  );

  const result = timeline.getActivityIntervals(lines, 6);
  expect(result.intervals.length).toBe(6);
  expect(result.intervals.map((i) => i.linesCount)).toEqual([1, 1, 3, 1, 1, 1]);
  expect(result.maxCount).toBe(3);
});

test("getActivityIntervals descending", () => {
  const lines = [
    makeMockLine(new Date(2021, 0, 1, 6)),
    makeMockLine(new Date(2021, 0, 1, 5)),
    makeMockLine(new Date(2021, 0, 1, 4)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 3)),
    makeMockLine(new Date(2021, 0, 1, 2)),
    makeMockLine(new Date(2021, 0, 1, 1)),
  ];

  const timeline = new TimelineDomain(
    new Date(2021, 0, 1, 6),
    new Date(2021, 0, 1, 1),
    100
  );

  const result = timeline.getActivityIntervals(lines, 6);
  expect(result.intervals.length).toBe(6);
  expect(result.intervals.map((i) => i.linesCount)).toEqual([1, 1, 3, 1, 1, 1]);
  expect(result.maxCount).toBe(3);
});