import { expect, test } from "vitest";
import { extractLineDate } from "./date-parsing";

// extract the date from the string
// if the date is not found, return null
// date can be in the following formats: 2022-09-26T21:01:15.972Z or 8/13/2021 2:01:35 PM or 09/15/2022-09:34:53.465 or 2022-09-27 11:06:00.000
// function getLineDate(line: string): Date | null {
//   const dateRegex =
//     /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)|(\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}:\d{2}\s(AM|PM))|(\d{1,2}\/\d{1,2}\/\d{4}-\d{2}:\d{2}:\d{2}\.\d{3})|(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})/g;
//   const dateString = line.match(dateRegex)?.[0];
//   if (dateString) {
//     return new Date(dateString.trim());
//   }
//   return null;
// }

test("should parse date of TMP TSW logs", () => {
  const line =
    "2022-09-26T21:01:15.972Z Inf	AppBarService: appInExecution: null";
  const date = extractLineDate(line);
  expect(date).not.toBe(null);
  expect(!isNaN((date as Date).valueOf())).toBe(true);
  expect(date).toEqual(new Date("2022-09-26T21:01:15.972Z"));
});

test("should parse date of UWP logs", () => {
  const line =
    "9/12/2022 11:15:00 PM,INFO,[9152][29][AgentConnection.cs:517:HandlePingRequest] [0:Crestron OEM Agent] Responding to agent ping";
  const date = extractLineDate(line, -10);
  expect(date).not.toBe(null);
  expect(!isNaN((date as Date).valueOf())).toBe(true);
  expect(date).toEqual(new Date("9/12/2022 11:15:00 PM -10"));
});

test("should parse date of UWP etl logs", () => {
  const line = "36E0.2C50,09/15/2022-09:34:47.156,,TL_INFO,.. log";
  const date = extractLineDate(line, -10);
  expect(date).not.toBe(null);
  expect(!isNaN((date as Date).valueOf())).toBe(true);
  expect(date).toEqual(new Date("09/15/2022-09:34:47.156 -10"));
});

test("should parse date of third party logs", () => {
  const line = "[2022-09-27 11:06:00.000] [INFO] ... log";
  const date = extractLineDate(line, -10);
  expect(date).not.toBe(null);
  expect(!isNaN((date as Date).valueOf())).toBe(true);
  expect(date).toEqual(new Date("2022-09-27 11:06:00.000 -10"));
});

test("should parse date of teams desktop logs", () => {
  const line =
    "Fri Sep 16 2022 07:58:15 GMT+1000 (Australian Eastern Standard Time) <7200> -- info -- ... log ";
  const date = extractLineDate(line, -10);
  expect(date).not.toBe(null);
  expect(!isNaN((date as Date).valueOf())).toBe(true);
  expect(date).toEqual(new Date("2022-09-16 07:58:15.000 +10"));
});
