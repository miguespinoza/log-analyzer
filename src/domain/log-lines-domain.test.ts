import { expect, test } from "vitest";
import { preProcessLogFile } from "./file-handling";
import {
  dedupeLogLines,
  parseLogFile,
  parseLogLines,
  searchLines,
  sortLines,
} from "./log-lines-domain";
import { Filter } from "./types";

test("should parse log line", () => {
  const logLine = "2022-09-26T15:49:53.444Z Inf	CID[main] log line";
  const { lines: parsedLogLine } = parseLogLines(
    [logLine],
    "test",
    "white",
    "fileID"
  );
  expect(parsedLogLine).toEqual([
    {
      date: new Date("2022-09-26T15:49:53.444Z"),
      fileName: "test",
      fileId: "fileID",
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
    "id",
    TMPTestLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(9);
});

test("should search lines with filters", () => {
  const { lines: aLines } = parseLogFile("id", TMPTestLogs, "a", "white");
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
  const { lines: aLines } = parseLogFile("id", TMPTestLogs, "a", "white");
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
    "id",
    fileA,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(13);
});

test("should parse teams desktop client logs.txt", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    "id",
    desktopClientLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(9);
});

test("should parse logs witout dates", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    "id",
    NoDatesLogs,
    "a",
    "white"
  );
  expect(aLines.length).toEqual(8);
  expect(linesWithoutDateCount).toEqual(8);
});

test("should parse UWP etl file", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    "id",
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
  const file = parseLogFile("id", desktopClientLogs, "a", "white");
  const sorted = sortLines("date", file.lines, [file]);
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

const TMPTestLogsDateSorting = `2022-09-26T15:50:18.624Z Inf	CDL: ...log
2022-09-26T15:50:18.632Z Inf	CDL: ...log
2022-09-26T15:50:18.634Z Inf	CDL: ...log
2022-09-26T15:50:18.636Z Inf	CDL: ...log
2022-09-26T15:50:18.636Z Inf	CDL: ...log
2022-09-26T15:50:18.637Z Inf	CDL: ...log
2022-09-26T15:50:18.653Z Inf	...log
2022-09-26T15:51:00.311Z Inf	...log
`;

const tmplogsDateSorting2 = `2022-09-26T15:50:34.452Z Inf	CDL: ...1
2022-09-26T15:50:34.452Z Inf	CDL: ...2
2022-09-26T15:50:34.453Z Inf	CDL: ...3
2022-09-26T15:50:34.455Z Inf	CDL: 4
2022-09-26T15:50:34.455Z Inf	CDL: 5 target
2022-09-26T15:50:34.455Z Inf	CDL: 6
2022-09-26T15:50:34.455Z Inf	CDL: 7
2022-09-26T15:50:34.460Z Inf	CDL: 8
2022-09-26T15:50:34.463Z Inf	...9
2022-09-26T15:50:34.463Z Inf	...10`;

test("test date sorting with one file that is sorted asc", () => {
  const tmplogsDateSorting2Asc = `
2022-09-26T15:50:34.463Z Inf	...10
2022-09-26T15:50:34.463Z Inf	...9
2022-09-26T15:50:34.460Z Inf	CDL: 8
2022-09-26T15:50:34.455Z Inf	CDL: 7
2022-09-26T15:50:34.455Z Inf	CDL: 6
2022-09-26T15:50:34.455Z Inf	CDL: 5 target
2022-09-26T15:50:34.455Z Inf	CDL: 4
2022-09-26T15:50:34.453Z Inf	CDL: ...3
2022-09-26T15:50:34.452Z Inf	CDL: ...2
2022-09-26T15:50:34.452Z Inf	CDL: ...1`;
  const file2 = preProcessLogFile({
    fileHandle: {} as any,
    content: tmplogsDateSorting2Asc,
    name: "two",
  });

  const merged = dedupeLogLines([file2], true);
  const sorted = sortLines("date", merged, [file2]);
  const linesDates = sorted.map((l) => l.text);
  expect(linesDates.map((d) => d)).toMatchInlineSnapshot(`
    [
      "2022-09-26T15:50:34.463Z Inf	...10",
      "2022-09-26T15:50:34.463Z Inf	...9",
      "2022-09-26T15:50:34.460Z Inf	CDL: 8",
      "2022-09-26T15:50:34.455Z Inf	CDL: 7",
      "2022-09-26T15:50:34.455Z Inf	CDL: 6",
      "2022-09-26T15:50:34.455Z Inf	CDL: 5 target",
      "2022-09-26T15:50:34.455Z Inf	CDL: 4",
      "2022-09-26T15:50:34.453Z Inf	CDL: ...3",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...2",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...1",
    ]
  `);
});

test("test date sorting with one file that is sorted desc", () => {
  const file2 = preProcessLogFile({
    fileHandle: {} as any,
    content: tmplogsDateSorting2,
    name: "two",
  });

  const merged = dedupeLogLines([file2], true);
  const sorted = sortLines("date", merged, [file2]);
  const linesDates = sorted.map((l) => l.text);
  expect(linesDates.map((d) => d)).toMatchInlineSnapshot(`
    [
      "2022-09-26T15:50:34.463Z Inf	...10",
      "2022-09-26T15:50:34.463Z Inf	...9",
      "2022-09-26T15:50:34.460Z Inf	CDL: 8",
      "2022-09-26T15:50:34.455Z Inf	CDL: 7",
      "2022-09-26T15:50:34.455Z Inf	CDL: 6",
      "2022-09-26T15:50:34.455Z Inf	CDL: 5 target",
      "2022-09-26T15:50:34.455Z Inf	CDL: 4",
      "2022-09-26T15:50:34.453Z Inf	CDL: ...3",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...2",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...1",
    ]
  `);
});

test("test date sorting with multiple files", () => {
  const file1 = preProcessLogFile({
    fileHandle: {} as any,
    content: TMPTestLogsDateSorting,
    name: "one",
  });
  const file2 = preProcessLogFile({
    fileHandle: {} as any,
    content: tmplogsDateSorting2,
    name: "two",
  });

  const merged = dedupeLogLines([file1, file2], true);
  const sorted = sortLines("date", merged, [file1, file2]);
  const linesDates = sorted.map((l) => l.text);
  expect(linesDates.map((d) => d)).toMatchInlineSnapshot(`
    [
      "2022-09-26T15:51:00.311Z Inf	...log
    ",
      "2022-09-26T15:50:34.463Z Inf	...10",
      "2022-09-26T15:50:34.463Z Inf	...9",
      "2022-09-26T15:50:34.460Z Inf	CDL: 8",
      "2022-09-26T15:50:34.455Z Inf	CDL: 7",
      "2022-09-26T15:50:34.455Z Inf	CDL: 6",
      "2022-09-26T15:50:34.455Z Inf	CDL: 5 target",
      "2022-09-26T15:50:34.455Z Inf	CDL: 4",
      "2022-09-26T15:50:34.453Z Inf	CDL: ...3",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...2",
      "2022-09-26T15:50:34.452Z Inf	CDL: ...1",
      "2022-09-26T15:50:18.653Z Inf	...log",
      "2022-09-26T15:50:18.637Z Inf	CDL: ...log",
      "2022-09-26T15:50:18.636Z Inf	CDL: ...log",
      "2022-09-26T15:50:18.634Z Inf	CDL: ...log",
      "2022-09-26T15:50:18.632Z Inf	CDL: ...log",
      "2022-09-26T15:50:18.624Z Inf	CDL: ...log",
    ]
  `);
});

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
