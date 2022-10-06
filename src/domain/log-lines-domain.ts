import { v4 as uuidv4, v5 as uuidHash } from "uuid";
import { Filter, LogFile } from "./types";
import { LogLine } from "./types";
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

const MY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export function parseLogLines(
  lines: string[],
  fileName: string,
  color: string,
  fileId: string
): {
  lines: LogLine[];
  linesWithoutDateCount: number;
  sorted: "asc" | "desc" | null;
} {
  const logLines: LogLine[] = [];
  let count = 0;
  let linesWithoutDateCount = 0;
  for (const line of lines) {
    count++;
    const date = getLineDate(line);
    if (date) {
      logLines.push({
        id: uuidv4(),
        fileId,
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
        fileId,
        hash: uuidHash(line, MY_NAMESPACE),
        date: null,
        count,
        fileName,
        text: line,
        fileColor: color,
      });
    }
  }
  return {
    lines: logLines,
    linesWithoutDateCount,
    sorted: areLinesSortedAscOrDesc(logLines),
  };
}

export function parseLogFile(
  fileId: string,
  text: string,
  fileName: string,
  color: string
): LogFile {
  const { lines, linesWithoutDateCount, sorted } = parseLogLines(
    separateLogLines(text),
    fileName,
    color,
    fileId
  );
  return {
    color,
    fileHandle: undefined as any,
    id: fileId,
    isVisible: true,
    lines,
    linesWithoutDateCount,
    name: fileName,
    sorted,
    text,
    timezone: 0,
  };
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
type SortedBy = "asc" | "desc" | null;
function areLinesSortedAscOrDesc(lines: LogLine[]): SortedBy {
  if (lines.length < 2) {
    return null;
  }
  const firstLineWithDate = lines.find((line) => line.date !== null);
  let lastLineWithDate = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].date !== null) {
      lastLineWithDate = lines[i];
      break;
    }
  }
  if (!firstLineWithDate || !lastLineWithDate) {
    return null;
  }
  if (firstLineWithDate.date && lastLineWithDate.date) {
    if (firstLineWithDate.date < lastLineWithDate.date) {
      return "asc";
    } else {
      return "desc";
    }
  }
  return null;
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
  lines: LogLine[],
  files: LogFile[]
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
    const fileSortedBy: (id: string) => SortedBy = (id) => {
      const file = files.find((l) => l.id === id);
      if (file) {
        return file.sorted;
      }
      return null;
    };
    return sortLogLineByDate(dateLogLines, true, fileSortedBy);
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

// sort objects by date
export function sortLogLineByDate(
  lines: LogLine[],
  descending: boolean,
  fileSortedBy: (fileId: string) => SortedBy
): LogLine[] {
  return lines.sort((a, b) => {
    if (a.date == null) {
      return -1;
    }
    if (b.date == null) {
      return 1;
    }
    if (b.date.getTime() === a.date.getTime()) {
      if (a.fileId !== b.fileId) {
        // if lines come from different files, preserve original sort order
        return 0;
      }
      // if lines come from the same file, sort by file order
      // if file is sorted, adapt the sort order to the one we are sorting by so that the sort is consistent with the file sort
      const fileSorted = fileSortedBy(a.fileId);
      if (descending) {
        if (fileSorted === "asc") {
          return b.count - a.count;
        } else {
          return a.count - b.count;
        }
      } else {
        if (fileSorted === "asc") {
          return a.count - b.count;
        } else {
          return b.count - a.count;
        }
      }
    }
    if (descending) {
      return b.date.getTime() - a.date.getTime();
    } else {
      return a.date.getTime() - b.date.getTime();
    }
  });
}
