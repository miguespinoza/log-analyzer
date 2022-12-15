import { describe, expect, test, vi } from "vitest";
import type { TextFilev2 } from "./file-handling";
import { LogFilesService } from "./log-files-service";
import { Filter } from "./types";
import { makeLogFile } from "./log-file";

vi.mock("./file-handling", () => ({
  getFileColor: () => "#000000",
}));

describe("LogFilesService", () => {
  test("should search lines with filters", () => {
    const fileA = makeLogFile({
      name: "a.log",
      content: TMPTestLogs,
      fileHandle: null as any,
    });
    expect(fileA.getLogLines().length).toEqual(9);
    const filter: Filter = {
      id: "test",
      color: "red",
      filter: "test filter",
      hitCount: 0,
    };
    const result = LogFilesService.filterLogLines(
      fileA.getLogLines(),
      [filter],
      null,
      null,
      false
    );
    expect(result.lines.length).toEqual(9);

    expect(result.filters[0].hitCount).toEqual(2);
  });

  test("should search lines with filters and hide all the lines that are not metched by a filter", () => {
    const fileA = makeLogFile({
      name: "a.log",
      content: TMPTestLogs,
      fileHandle: null as any,
    });
    expect(fileA.getLogLines().length).toEqual(9);
    const filter: Filter = {
      id: "test",
      color: "red",
      filter: "test filter",
      hitCount: 0,
    };
    const result = LogFilesService.filterLogLines(
      fileA.getLogLines(),
      [filter],
      null,
      null,
      true
    );
    expect(result.lines.length).toEqual(2);

    expect(result.filters[0].hitCount).toEqual(2);
  });

  test.only("should search filter by date", () => {
    const fileA = makeLogFile({
      name: "a.log",
      content: TMPTestLogs,
      fileHandle: null as any,
    });

    expect(fileA.getLogLines().length).toEqual(9);

    const result = LogFilesService.filterLogLines(
      fileA.getLogLines(),
      [],
      new Date("2022-09-26T15:49:53.445Z"),
      new Date("2022-09-26T15:49:53.446Z"),
      true
    );
    expect(result.lines.length).toEqual(4);
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
    const file = makeLogFile({
      name: "a",
      content: desktopClientLogs,
    } as TextFilev2);
    const sorted = LogFilesService.sortLogLines(
      "date",
      "desc",
      file.getLogLines(),
      [file]
    );
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
    const file2 = makeLogFile({
      fileHandle: {} as any,
      content: tmplogsDateSorting2Asc,
      name: "two",
    });

    const merged = LogFilesService.mergeLogFiles([file2]);
    const sorted = LogFilesService.sortLogLines("date", "desc", merged, [
      file2,
    ]);
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
    const file2 = makeLogFile({
      fileHandle: {} as any,
      content: tmplogsDateSorting2,
      name: "two",
    });

    const merged = LogFilesService.mergeLogFiles([file2]);
    const sorted = LogFilesService.sortLogLines("date", "desc", merged, [
      file2,
    ]);
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
    const file1 = makeLogFile({
      fileHandle: {} as any,
      content: TMPTestLogsDateSorting,
      name: "one",
    });
    const file2 = makeLogFile({
      fileHandle: {} as any,
      content: tmplogsDateSorting2,
      name: "two",
    });

    const merged = LogFilesService.mergeLogFiles([file1, file2]);
    const sorted = LogFilesService.sortLogLines("date", "desc", merged, [
      file1,
      file2,
    ]);
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
});
