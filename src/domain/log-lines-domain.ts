import { v4 as uuidv4, v5 as uuidHash } from "uuid";
import { Filter, LogFile } from "../components/LogFilesContext";
import { extractLineDate, removeOriginalDate } from "./date-parsing";

// line starts with date 2022-09-26T15:49:53.444Z
function isNewLogLine(line: string) {
  const date = getLineDate(line);
  return date !== null && !isNaN(date.getTime());
}

function getLineDate(line: string, fileTimeZone: number = 0) {
  return extractLineDate(line, fileTimeZone);
}

function splitTextByLines(text: string): string[] {
  return text.split(/\r?\n/);
}

function separateLogLines(text: string): string[] {
  const rawLines = splitTextByLines(text);
  const logLines = [];
  for (const line of rawLines) {
    if (isNewLogLine(line)) {
      logLines.push(line);
    } else {
      if (logLines[logLines.length - 1]) {
        logLines[logLines.length - 1] += `\n${line}`;
      } else {
        logLines.push(line);
      }
    }
  }
  if (logLines.length / rawLines.length < 0.5) {
    console.log("too many lines were not parsed, returning raw lines");
    return rawLines;
  }
  return logLines;
}

export interface LogLine {
  id: string;
  date: Date | null;
  count: number;
  hash: string;
  fileName: string;
  text: string;
  matchedFilters?: Omit<Filter, "hitCount">;
  fileColor: string;
}
const MY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export function parseLogLines(
  lines: string[],
  fileName: string,
  color: string
): { lines: LogLine[]; linesWithoutDateCount: number } {
  const logLines: LogLine[] = [];
  let count = 0;
  let linesWithoutDateCount = 0;
  for (const line of lines) {
    count++;
    const date = getLineDate(line);
    if (date) {
      logLines.push({
        id: uuidv4(),
        hash: uuidHash(line, MY_NAMESPACE),
        date,
        count,
        fileName,
        text: line,
        fileColor: color,
      });
    } else {
      linesWithoutDateCount++;
      logLines.push({
        id: uuidv4(),
        hash: uuidHash(line, MY_NAMESPACE),
        date: null,
        count,
        fileName,
        text: line,
        fileColor: color,
      });
    }
  }
  return { lines: logLines, linesWithoutDateCount };
}

export function parseLogFile(
  text: string,
  fileName: string,
  color: string
): { lines: LogLine[]; linesWithoutDateCount: number } {
  return parseLogLines(separateLogLines(text), fileName, color);
}

export function dedupeLogLines(
  logFiles: LogFile[],
  showOGDate: boolean
): LogLine[] {
  // identify duplicates by date and text and remove them, return merged array
  const existingLinesHashes = new Set();
  const mergedLines = [];
  for (const file of logFiles) {
    for (const line of file.lines) {
      if (!existingLinesHashes.has(line.hash)) {
        const newLine = { ...line };
        const updatedDate = getLineDate(newLine.text, file.timezone);
        newLine.date = updatedDate;
        if (!showOGDate) {
          newLine.text = removeOriginalDate(line.text);
        }
        mergedLines.push(newLine);
        existingLinesHashes.add(newLine.hash);
      }
    }
  }
  return mergedLines;
}

export function searchLines(
  lines: LogLine[],
  filters?: Filter[],
  startDate?: Date,
  endDate?: Date
): { lines: LogLine[]; filters: Filter[] } {
  const activeFilters = (filters ?? []).filter((f) => !f.isDisabled);
  if (activeFilters.length === 0 && !startDate && !endDate) {
    return { lines, filters: filters ?? [] };
  }
  (filters ?? []).forEach((f) => {
    f.hitCount = 0;
  });
  const filteredLines: LogLine[] = [];
  for (const line of lines) {
    const matchesStartDate =
      startDate != null && line.date != null ? line.date >= startDate : true;
    const matchesEndDate =
      endDate != null && line.date != null ? line.date <= endDate : true;

    if (filters != null) {
      for (const filter of filters) {
        if (!filter.excluding) {
          const matchedFilters = filterMatchesLine(filter, line);
          if (matchedFilters && matchesStartDate && matchesEndDate) {
            if (!filter.isDisabled) {
              filteredLines.push({ ...line, matchedFilters: filter });
            }
            filter.hitCount++;
            break;
          }
        }
      }
    } else {
      if (matchesStartDate && matchesEndDate) {
        filteredLines.push(line);
      }
    }
  }
  const newFilters = filters?.map((f) => f) ?? [];
  return { lines: filteredLines, filters: newFilters };
}

function filterMatchesLine(filter: Filter, line: LogLine) {
  return line.text.toLowerCase().includes(filter.filter.toLowerCase());
}

export function sortLines(
  sortBy: "date" | "file",
  lines: LogLine[]
): LogLine[] {
  if (sortBy === "date") {
    const dateLogLines = lines.filter((l) => l.date != null);
    if (lines.length - dateLogLines.length > 0) {
      console.error(
        `some lines do not have date, ${
          lines.length - dateLogLines.length
        } ommited due to sorting by date`
      );
    }
    return dateLogLines.sort(
      (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
    );
  } else if (sortBy === "file") {
    return lines.sort((a, b) => {
      if (a.fileName !== b.fileName) {
        return a.fileName.localeCompare(b.fileName);
      } else {
        return a.count - b.count;
      }
    });
  } else {
    return lines;
  }
}
