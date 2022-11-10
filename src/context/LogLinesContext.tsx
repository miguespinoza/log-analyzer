import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LogFilesService } from "../domain/log-files-service";
import { useFilesContext } from "./FileContext";
import { MemoComponent } from "../components/MemoComponent";
import { Filter, ILogFile, LogLine } from "../domain/types";
import { useProjectFileContext } from "./ProjectFileContext";

export type LogLinesContextType = {
  logFiles: ILogFile[];
  lines: LogLine[];
  allLines: LogLine[];
  updateLogFile: (file: ILogFile) => void;
  updateFileTimezone: (file: ILogFile, timezone: number) => void;
  apliedFilters: Filter[];
};

export type DateFilterContextType = {
  start?: Date;
  end?: Date;
  setStart: (start?: Date) => void;
  setEnd: (end?: Date) => void;
};

const DateFilterContext = React.createContext<DateFilterContextType>({
  setStart: () => {},
  setEnd: () => {},
});

export const useDateFilterContext = () => React.useContext(DateFilterContext);

export const DateFilterContextProvider = ({ children }: any) => {
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  return (
    <DateFilterContext.Provider value={{ start, end, setStart, setEnd }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const LogLinesContext = React.createContext<LogLinesContextType>({
  logFiles: [],
  lines: [],
  updateLogFile: () => {},
  updateFileTimezone: () => {},
  apliedFilters: [],
  allLines: [],
});

export const LogLinesContextProvider = ({ children }: any) => {
  const { logFiles, updateLogFile } = useFilesContext();
  const { project, filters } = useProjectFileContext();
  const { hideUnfiltered, sortBy } = project;

  const [mergedLines, setMergedLines] = useState<LogLine[]>([]);
  const [sortedLines, setSortedLines] = useState<LogLine[]>([]);

  // merges and dedupes all log lines from all files
  useEffect(() => {
    LogFilesService.mergeLogFiles(logFiles.filter((f) => f.isVisible)).then(
      (lines) => setMergedLines(lines)
    );
  }, [logFiles]);

  // sorts the lines
  const lines = useEffect(() => {
    LogFilesService.sortLogLines(
      sortBy,
      project.sortDirection,
      mergedLines,
      logFiles
    ).then((lines) => setSortedLines(lines));
  }, [mergedLines, logFiles, sortBy, project.sortDirection]);

  // filters the sorted lines, no need to re-sort since the lines are already sorted
  const filteredLines = useMemo(() => {
    const filtersResult = LogFilesService.filterLogLines(
      sortedLines,
      filters,
      hideUnfiltered
    );
    return {
      lines: filtersResult.lines,
      filters: filtersResult.filters,
    };
  }, [sortedLines, filters, hideUnfiltered]);

  const updateFileTimezone = useCallback(
    (file: ILogFile, newTimezone: number) => {
      const newFile = { ...file, timezone: newTimezone };
      updateLogFile(newFile);
    },
    [updateLogFile]
  );

  const data = useMemo<LogLinesContextType>(
    () => ({
      logFiles,
      allLines: sortedLines,
      lines: filteredLines.lines,
      apliedFilters: filteredLines.filters,
      updateLogFile,
      updateFileTimezone,
    }),
    [
      logFiles,
      sortedLines,
      filteredLines.lines,
      filteredLines.filters,
      updateLogFile,
      updateFileTimezone,
    ]
  );
  return (
    <LogLinesContext.Provider value={data}>
      <MemoComponent>{children}</MemoComponent>
    </LogLinesContext.Provider>
  );
};

export function useLogLinesContext() {
  return React.useContext(LogLinesContext);
}
