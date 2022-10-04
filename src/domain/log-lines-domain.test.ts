import { expect, test } from "vitest";
import { Filter } from "../components/LogFilesContext";
import {
  parseLogFile,
  parseLogLines,
  searchLines,
  sortLines,
} from "./log-lines-domain";

test("should parse log line", () => {
  const logLine = "2022-09-26T15:49:53.444Z Inf	CID[main] log line";
  const { lines: parsedLogLine } = parseLogLines([logLine], "test", "white");
  expect(parsedLogLine).toEqual([
    {
      date: new Date("2022-09-26T15:49:53.444Z"),
      fileName: "test",
      hash: "6fc3aa43-1bf1-5a3d-b439-bee6dd7f6707",
      id: expect.any(String),
      text: "2022-09-26T15:49:53.444Z Inf	CID[main] log line",
      count: 1,
      fileColor: "white",
    },
  ]);
});
test("should parse log file", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    TMPTestLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(9);
});

test("should search lines with filters", () => {
  const { lines: aLines } = parseLogFile(TMPTestLogs, "a", "white");
  expect(aLines.length).toEqual(9);
  const filter: Filter = {
    id: "test",
    color: "red",
    filter: "test filter",
    hitCount: 0,
  };
  const result = searchLines(aLines, false, [filter]);
  expect(result.lines.length).toEqual(9);

  expect(result.filters[0].hitCount).toEqual(2);
});

test("should search lines with filters and hide all the lines that are not metched by a filter", () => {
  const { lines: aLines } = parseLogFile(TMPTestLogs, "a", "white");
  expect(aLines.length).toEqual(9);
  const filter: Filter = {
    id: "test",
    color: "red",
    filter: "test filter",
    hitCount: 0,
  };
  const result = searchLines(aLines, true, [filter]);
  expect(result.lines.length).toEqual(2);

  expect(result.filters[0].hitCount).toEqual(2);
});

test("should parse log file", () => {
  const fileA = `9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][102] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
  `;

  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    fileA,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(13);
});

test("should parse teams desktop client logs.txt", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    desktopClientLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(9);
});

test("should parse logs witout dates", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    NoDatesLogs,
    "a",
    "white"
  );
  expect(aLines.length).toEqual(8);
  expect(linesWithoutDateCount).toEqual(8);
});

test("should parse UWP etl file", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    etlTestLogs,
    "a",
    "white"
  );
  expect(aLines.length).toEqual(12);
  expect(linesWithoutDateCount).toEqual(0);
});

test("should sort by date preserving the same file order if timestamp is the same", () => {
  const desktopClientLogs = `Wed Sep 28 2022 12:59:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:00:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log target
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 1
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 2
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 3
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 4
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 5
Wed Sep 28 2022 13:00:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:01:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log`;
  const { lines } = parseLogFile(desktopClientLogs, "a", "white");
  const sorted = sortLines("date", lines);
  expect(sorted.map((l) => l.count)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
});

const TMPTestLogs = `2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line test filter
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line test filter
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
    grouped line
    grouped line
    grouped line
`;

const etlTestLogs = `36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line
    grouped line
    grouped line
    grouped line
    grouped line
    grouped line
    grouped line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line`;

const NoDatesLogs = `<7200> -- info -- ... log line
<7200> -- info -- ... log line
<7200> -- info -- ... log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line`;

const desktopClientLogs = `Wed Sep 28 2022 12:59:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:00:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log target
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 1
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 2
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 3
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 4
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 5
Wed Sep 28 2022 13:00:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:01:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log`;