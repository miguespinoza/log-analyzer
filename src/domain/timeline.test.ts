import { expect, test } from "vitest";
import { getDateFromRelativePx, getRelativeTimePx } from "./timeline";

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
