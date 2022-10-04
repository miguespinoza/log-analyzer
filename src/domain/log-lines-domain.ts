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

function isEmptyOrhasOnlySpaces(text: string) {
  return text.trim().length === 0;
}

function separateLogLines(text: string): string[] {
  const rawLines = splitTextByLines(text);
  const logLines = [];
  let processedLinesCount = 0;
  for (const line of rawLines) {
    if (isNewLogLine(line)) {
      logLines.push(line);
      processedLinesCount++;
    } else {
      if (logLines[logLines.length - 1]) {
        logLines[logLines.length - 1] += `\n${line}`;
        if (isEmptyOrhasOnlySpaces(line)) {
          processedLinesCount++;
        }
      } else {
        if (isEmptyOrhasOnlySpaces(line)) {
          processedLinesCount++;
        }
        logLines.push(line);
      }
    }
  }
  if (processedLinesCount / rawLines.length < 0.5) {
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
  isVisible?: boolean;
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
  hideUnmatchedLines: boolean,
  filters?: Filter[]
): { lines: LogLine[]; filters: Filter[] } {
  if (filters == null || filters.length === 0) {
    return { lines, filters: [] };
  }

  const activeFilters = (filters ?? []).filter((f) => !f.isDisabled);
  lines.forEach((line) => {
    line.isVisible = !hideUnmatchedLines;
    line.matchedFilters = undefined;
  });

  if (activeFilters.length === 0) {
    return { lines, filters: filters ?? [] };
  }
  (filters ?? []).forEach((f) => {
    f.hitCount = 0;
  });
  for (const line of lines) {
    for (const filter of filters) {
      const matchedFilter = filterMatchesLine(filter, line);
      if (matchedFilter) {
        filter.hitCount++;
        if (filter.isDisabled) {
          // increase filter hit count and continue to next filter
          continue;
        }
        line.isVisible = true;
        if (filter.excluding) {
          line.isVisible = false;
        }
        line.matchedFilters = filter;
        break;
      }
    }
  }
  const newFilters = filters?.map((f) => f) ?? [];
  const filteredLines = lines.filter((line) => line.isVisible);
  return {
    lines: filteredLines,
    filters: newFilters,
  };
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
    return dateLogLines.sort((a, b) => {
      const aTime = a.date?.getTime() ?? 0;
      const bTime = a.date?.getTime() ?? 0;
      if (aTime > bTime) {
        return -1;
      } else if (aTime < bTime) {
        return 1;
      } else {
        return b.count - a.count;
      }
    });
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
