// import { makeLogFile } from "./log-file";
// import { describe, expect, test, vi } from "vitest";
export const s = 1;
// vi.mock("./file-handling", () => ({
//   getFileColor: () => "#000000",
// }));

// describe("LogFile", () => {
//   test("should parse a single log line", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: "2022-09-26T15:49:53.444Z Inf	CID[main] log line",
//       fileHandle: null as any,
//     });

//     expect(logFile.getLogLines()).toEqual([
//       {
//         date: new Date("2022-09-26T15:49:53.444Z"),
//         fileName: "test.log",
//         fileId: expect.any(String),
//         hash: "6fc3aa43-1bf1-5a3d-b439-bee6dd7f6707",
//         id: expect.any(String),
//         text: "2022-09-26T15:49:53.444Z Inf	CID[main] log line",
//         textWithoutDate: " Inf	CID[main] log line",
//         count: 1,
//         fileColor: "#000000",
//       },
//     ]);
//   });

//   test("should parse multiple TMP log lines", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: TMPTestLogs,
//       fileHandle: null as any,
//     });
//     expect(logFile.getLogLines().length).toEqual(9);
//     expect(logFile.linesWithoutDateCount).toEqual(0);
//   });

//   test("should parse multiple other date format log lines", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: otherDateFormatLogs,
//       fileHandle: null as any,
//     });
//     expect(logFile.getLogLines().length).toEqual(13);
//     expect(logFile.linesWithoutDateCount).toEqual(0);
//   });

//   test("should parse multiple desktop log lines", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: desktopClientLogs,
//       fileHandle: null as any,
//     });
//     expect(logFile.getLogLines().length).toEqual(9);
//     expect(logFile.linesWithoutDateCount).toEqual(0);
//   });

//   test("should parse multiple logs without dates lines", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: NoDatesLogs,
//       fileHandle: null as any,
//     });
//     expect(logFile.getLogLines().length).toEqual(8);
//     expect(logFile.linesWithoutDateCount).toEqual(8);
//   });

//   test("should parse multiple etl logs lines", () => {
//     const logFile = makeLogFile({
//       name: "test.log",
//       content: etlTestLogs,
//       fileHandle: null as any,
//     });
//     expect(logFile.getLogLines().length).toEqual(12);
//     expect(logFile.linesWithoutDateCount).toEqual(0);
//   });
// });

// const desktopClientLogs = `Wed Sep 28 2022 12:59:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
// Wed Sep 28 2022 13:00:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log target
// Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 1
// Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 2
// Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 3
// Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 4
// Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 5
// Wed Sep 28 2022 13:00:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
// Wed Sep 28 2022 13:01:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log`;

// const otherDateFormatLogs = `9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
// 9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][102] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
// 9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
//   `;

// const TMPTestLogs = `2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.445Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.445Z Inf	CID[main] ...log line test filter
// 2022-09-26T15:49:53.446Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.446Z Inf	CID[main] ...log line test filter
// 2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
// 2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
//     grouped line
//     grouped line
//     grouped line
// `;

// const NoDatesLogs = `<7200> -- info -- ... log line
// <7200> -- info -- ... log line
// <7200> -- info -- ... log line
// <7200> -- event -- ...log line
// <7200> -- event -- ...log line
// <7200> -- event -- ...log line
// <7200> -- event -- ...log line
// <7200> -- event -- ...log line`;

// const etlTestLogs = `36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
// 36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line
//     grouped line
//     grouped line
//     grouped line
//     grouped line
//     grouped line
//     grouped line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
// 36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
// 36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line`;
