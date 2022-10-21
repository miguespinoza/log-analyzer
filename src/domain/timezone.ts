export type Timezone = {
  name: string;
  offset: number;
};

// list of all timezones
export const timezones: Timezone[] = [
  { name: "GMT", offset: 0 },
  { name: "GMT+1", offset: 1 },
  { name: "GMT+2", offset: 2 },
  { name: "GMT+3", offset: 3 },
  { name: "GMT+4", offset: 4 },
  { name: "GMT+5", offset: 5 },
  { name: "GMT+6", offset: 6 },
  { name: "GMT+7", offset: 7 },
  { name: "GMT+8", offset: 8 },
  { name: "GMT+9", offset: 9 },
  { name: "GMT+10", offset: 10 },
  { name: "GMT+11", offset: 11 },
  { name: "GMT+12", offset: 12 },
  { name: "GMT-1", offset: -1 },
  { name: "GMT-2", offset: -2 },
  { name: "GMT-3", offset: -3 },
  { name: "GMT-4", offset: -4 },
  { name: "GMT-5", offset: -5 },
  { name: "GMT-6", offset: -6 },
  { name: "GMT-7", offset: -7 },
  { name: "GMT-8", offset: -8 },
  { name: "GMT-9", offset: -9 },
  { name: "GMT-10", offset: -10 },
  { name: "GMT-11", offset: -11 },
  { name: "GMT-12", offset: -12 },
];

// Etc/GMT+0
function getTimeZoneName(offset: number) {
  const tzName = `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
  return tzName;
}

// formats date as 2022-09-26T15:50:19.939
export function getDateStringAtTz(date: Date, timezone: number) {
  return (
    date.toLocaleDateString("en-US", {
      timeZone: getTimeZoneName(timezone),
    }) +
    " " +
    date.toLocaleTimeString("en-US", {
      timeZone: getTimeZoneName(timezone),
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
      fractionalSecondDigits: 3,
    })
  );
}
