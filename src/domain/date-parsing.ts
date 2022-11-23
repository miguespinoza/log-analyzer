import { parse } from "date-fns";

// extract the date from the string
// if the date is not found, return null
// date can be in the following formats: 2022-09-26T21:01:15.972Z or 8/13/2021 2:01:35 PM or 09/15/2022-09:34:53.465 or 2022-09-27 11:06:00.000
const WebdateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
const DesktopdateRegex =
  /^(\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}:\d{2}\s(AM|PM))/;
const EtldateRegex =
  /((.{10})\d{1,2}\/\d{1,2}\/\d{4}-\d{2}:\d{2}:\d{2}\.\d{3})/;
const ThirddateRegex = /^(\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})/;
// regex to match Fri Sep 16 2022 07:58:16 GMT+1000
const TeamsDesktopDateRegex =
  /^([A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT(\+|-)\d{4})/;

// regex to match 2022-11-15 12:31:13 PM
const YearFirstDateRegex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s(AM|PM))/;

// regex to match 17/11/2022 10:00:38 or
const DDmmyyy24hour = /^(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/;

// match 23-11-2022 10:54:07
const DDmmyyy24hourDashed = /^(\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2})/;

export function removeOriginalDate(line: string) {
  for (const parser of dateParsers) {
    if (parser.regex.test(line)) {
      return line.replace(parser.regex, "");
    }
  }
  return line;
}

type DateParser = {
  regex: RegExp;
  parser: (line: string, timezoneDelta: number) => Date | null;
};

export function doesLogLineHasTimezonInfo(stringDate: string) {
  return (
    WebdateRegex.test(stringDate) || TeamsDesktopDateRegex.test(stringDate)
  );
}

const dateParsers: DateParser[] = [
  { regex: WebdateRegex, parser: parseWebDate },
  { regex: DesktopdateRegex, parser: parseDesktopDate },
  { regex: EtldateRegex, parser: parseEtlDate },
  { regex: ThirddateRegex, parser: parseThirdDate },
  { regex: TeamsDesktopDateRegex, parser: parseTeamsDesktopDate },
  { regex: YearFirstDateRegex, parser: parseYearFirstDate },
  {
    regex: DDmmyyy24hour,
    parser: getSimpleParser(DDmmyyy24hour, "dd/MM/yyyy HH:mm:ss X"),
  },
  {
    regex: DDmmyyy24hourDashed,
    parser: getSimpleParser(DDmmyyy24hourDashed, "dd-MM-yyyy HH:mm:ss X"),
  },
];

export function extractLineDate(
  line: string,
  timezoneDelta: number = 0
): Date | null {
  for (const parser of dateParsers) {
    if (parser.regex.test(line)) {
      return parser.parser(line, timezoneDelta);
    }
  }
  return null;
}

// converts timezone offset in hours to ISO-8601 format
function getTimeZoneString(delta: number) {
  if (delta === 0) {
    return "Z";
  }
  const sign = delta > 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(delta));
  //const minutes = Math.floor((Math.abs(delta) - hours) * 60);
  return `${sign}${hours.toString().padStart(2, "0")}`;
}

// parse 8/13/2021 2:01:35 PM
function parseDesktopDate(line: string, timezoneDelta: number) {
  const dateString = line.match(DesktopdateRegex)?.[0];
  if (dateString) {
    const dString = `${dateString.trim()} ${getTimeZoneString(timezoneDelta)}`;
    const date = parse(dString, "M/dd/yyyy h:mm:ss a X", new Date());
    return date;
  }
  return null;
}

function getSimpleParser(regex: RegExp, format: string) {
  return (line: string, timezoneDelta: number) => {
    const dateString = line.match(regex)?.[0];
    if (dateString) {
      const dString = `${dateString.trim()} ${getTimeZoneString(
        timezoneDelta
      )}`;
      const date = parse(dString, format, new Date());
      return new Date(date.getTime() + timezoneDelta);
    }
    return null;
  };
}

// parse 2022-11-15 12:31:13 PM
function parseYearFirstDate(line: string, timezoneDelta: number) {
  const dateString = line.match(YearFirstDateRegex)?.[0];
  if (dateString) {
    const dString = `${dateString.trim()} ${getTimeZoneString(timezoneDelta)}`;
    const date = parse(dString, "yyyy-MM-dd h:mm:ss a X", new Date());
    return date;
  }
  return null;
}

// parse 09/15/2022-09:34:53.465
function parseEtlDate(line: string, timezoneDelta: number) {
  const dateString = line.match(EtldateRegex)?.[0];
  if (dateString) {
    const dString = `${dateString.substring(10).trim()} ${getTimeZoneString(
      timezoneDelta
    )}`;
    const date = new Date(dString);
    return date;
  }
  return null;
}

// parse 2022-09-27 11:06:00.000
function parseThirdDate(line: string, timezoneDelta: number) {
  const dateString = line.match(ThirddateRegex)?.[0];
  if (dateString) {
    const dString = `${dateString.substring(1).trim()} ${getTimeZoneString(
      timezoneDelta
    )}`;
    const date = parse(dString, "yyyy-MM-dd hh:mm:ss.SSS X", new Date());
    return date;
  }
  return null;
}

function parseWebDate(line: string) {
  const dateString = line.match(WebdateRegex)?.[0];
  if (dateString) {
    const date = new Date(dateString.trim());
    return date;
  }
  return null;
}

// extract date from line Fri Sep 16 2022 07:58:16 GMT+1000 (Australian Eastern Standard Time) <7200> -- event -- eventpdclevel: 2, name: get_user_profile_e
function parseTeamsDesktopDate(line: string) {
  const dateString = line.match(TeamsDesktopDateRegex)?.[0];
  if (dateString) {
    const dString = dateString.substring(4).replace("GMT", "");
    const date = new Date(dString);
    return date;
  }
  return null;
}
