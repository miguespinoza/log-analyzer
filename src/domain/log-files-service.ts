import Fuse from "fuse.js";
import { Filter, ILogFile, SortDirection } from "./types";
import { LogLine } from "./types";

interface ILogFilesService {
  mergeLogFiles(logFiles: ILogFile[]): Promise<LogLine[]>;
  filterLogLines(
    lines: LogLine[],
    filters: Filter[],
    hideUnmatchedLines: boolean
  ): { lines: LogLine[]; filters: Filter[] };
  sortLogLines(
    sortBy: "date" | "file",
    direction: SortDirection,
    lines: LogLine[],
    files: ILogFile[]
  ): Promise<LogLine[]>;
}

// like a static class
class LogFilesServiceImplementation implements ILogFilesService {
  public async mergeLogFiles(logFiles: ILogFile[]): Promise<LogLine[]> {
    // identify duplicates by date and text and remove them, return merged array
    const existingLinesHashes = new Set();
    const mergedLines = [];
    for (let file of logFiles) {
      const lines = await file.getLogLines();
      for (const line of lines) {
        if (!existingLinesHashes.has(line.hash)) {
          mergedLines.push(line);
          existingLinesHashes.add(line.hash);
        }
      }
    }
    return mergedLines;
  }
  public filterLogLines(
    allLines: LogLine[],
    filters: Filter[],
    hideUnmatchedLines: boolean
  ) {
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
        const matchedFilter = this.filterMatchesLine(filter, line);
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

  public async sortLogLines(
    sortBy: "date" | "file",
    direction: SortDirection,
    lines: LogLine[],
    files: ILogFile[]
  ) {
    if (sortBy === "date") {
      const dateLogLines = lines.filter((l) => l.date != null);
      if (lines.length - dateLogLines.length > 0) {
        console.error(
          `some lines do not have date, ${
            lines.length - dateLogLines.length
          } ommited due to sorting by date`
        );
      }

      const fileSortedDirectionMap = new Map<string, SortDirection>();
      const promises = files.map(async (file) => {
        file.getFileSortDirection().then((d) => {
          fileSortedDirectionMap.set(file.id, d);
        });
      });
      await Promise.all(promises);
      const fileSortedBy: (id: string) => SortDirection = (id) => {
        const direction = fileSortedDirectionMap.get(id);
        return direction ?? null;
      };
      return this.sortLogLineByDate(
        dateLogLines,
        direction === "desc",
        fileSortedBy
      );
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

  private filterMatchesLine(filter: Filter, line: LogLine) {
    return line.text.toLowerCase().includes(filter.filter.toLowerCase());
  }

  private sortLogLineByDate(
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
}

export type ScenarioStep = {
  name: string;
  step: string;
  stepNumber: number;
  lineHash: string;
  timestamp: number;
};
interface ScenarioDiscoveryService {
  indexScenarios(lines: LogLine[]): void;
  searchScenarios(search: string): ScenarioStep[];
}

export class ScenarioDiscoveryServiceImplementation
  implements ScenarioDiscoveryService
{
  public scenarios: Set<string> = new Set();
  private fuse: Fuse<LogLine> | null = null;

  public indexScenarios(lines: LogLine[]): void {
    const linesWithScenarios = [];

    for (const line of lines) {
      const scenario = this.parseScenarioLine(line);
      if (scenario) {
        this.scenarios.add(scenario.name);
        linesWithScenarios.push(line);
      }
    }
    console.time("indexing scenarios");
    this.fuse = new Fuse(linesWithScenarios, { keys: ["text"] });
    console.timeEnd("indexing scenarios");
  }

  public searchScenarios(search: string) {
    if (this.fuse == null) {
      console.error("scenarios not indexed");
      return [];
    }

    const results = this.fuse.search(search);
    const scenarios = [];
    for (const result of results) {
      const scenario = this.parseScenarioLine(result.item);
      if (scenario) {
        scenarios.push(scenario);
      }
    }
    return scenarios;
  }

  private parseScenarioLine(line: LogLine): ScenarioStep | undefined {
    // match [Scenario]people_get_all_short_profile [step](0)error (56ms)
    // [Scenario]video_stream_rendering start
    const match = line.text.match(/\[Scenario\](\S*)/);
    if (match) {
      const step = this.getScenarioStep(line.text);
      return {
        name: match[1],
        step: step?.name ?? "",
        stepNumber: step?.stepNumber ?? 0,
        lineHash: line.hash,
        timestamp: parseInt(match[4]),
      };
    }
  }

  private getScenarioStep(line: string) {
    const match = line.match(/\[step\]\((\d*)\)(.*)/);
    if (match) {
      return {
        stepNumber: parseInt(match[1]),
        name: match[2],
      };
    }
  }
}

export const scenarioDiscoveryService =
  new ScenarioDiscoveryServiceImplementation();

export const LogFilesService = new LogFilesServiceImplementation();
