import { Filter, ILogFile, SortDirection } from "./types";
import { LogLine } from "./types";

// line starts with date 2022-09-26T15:49:53.444Z

export function dedupeLogLines(logFiles: ILogFile[]): LogLine[] {
  // identify duplicates by date and text and remove them, return merged array
  const existingLinesHashes = new Set();
  const mergedLines = [];
  for (let file of logFiles) {
    for (const line of file.getLogLines() ?? []) {
      if (!existingLinesHashes.has(line.hash)) {
        mergedLines.push(line);
        existingLinesHashes.add(line.hash);
      }
    }
  }
  return mergedLines;
}

export function searchLines(
  allLines: LogLine[],
  hideUnmatchedLines: boolean,
  filters?: Filter[]
): { lines: LogLine[]; filters: Filter[] } {
  const lines = [...allLines];
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
  direction: SortDirection,
  lines: LogLine[],
  files: ILogFile[]
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
    const fileSortedBy: (id: string) => SortDirection = (id) => {
      const file = files.find((l) => l.id === id);
      if (file) {
        return file.sorted ?? null;
      }
      return null;
    };
    return sortLogLineByDate(dateLogLines, direction === "desc", fileSortedBy);
  } else if (sortBy === "file") {
    return lines.sort((a, b) => {
      if (a.fileName !== b.fileName) {
        return a.fileName.localeCompare(b.fileName);
      } else {
        if (direction === "asc") {
          return a.count - b.count;
        } else {
          return b.count - a.count;
        }
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
  fileSortedBy: (fileId: string) => SortDirection
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
