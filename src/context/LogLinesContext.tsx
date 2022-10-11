import React, { useEffect, useMemo, useState } from "react";
import {
  dedupeLogLines,
  searchLines,
  sortLines,
} from "../domain/log-lines-domain";
import { useFilesContext } from "./FileContext";
import { MemoComponent } from "../components/MemoComponent";
import { Filter, LogFile, LogLine } from "../domain/types";
import { useProjectFileContext } from "./ProjectFileContext";

export type LogLinesContextType = {
  logFiles: LogFile[];
  lines: LogLine[];
  updateLogFile: (file: LogFile) => void;
  mergeLogFiles: () => void;
  apliedFilters: Filter[];
  logsAreInSync: boolean;
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
  logsAreInSync: true,
  mergeLogFiles: () => {},
  apliedFilters: [],
});

export const LogLinesContextProvider = ({ children }: any) => {
  const [logsAreInSync, setLogsAreInSync] = useState(true);
  const [lines, setLines] = React.useState<LogLine[]>([]);
  const { logFiles, updateLogFile } = useFilesContext();
  const { project, filters } = useProjectFileContext();
  const { hideUnfiltered, showOGDate, sortBy } = project;

  const mergeLogFiles = React.useCallback(() => {
    const mergedLines = dedupeLogLines(
      logFiles.filter((f) => f.isVisible),
      showOGDate
    );
    setLines(mergedLines);
    setLogsAreInSync(true);
  }, [logFiles, showOGDate]);

  useEffect(() => {
    mergeLogFiles();
  }, [mergeLogFiles]);

  const filteredLines = useMemo(() => {
    const filtersResult = searchLines(lines, hideUnfiltered, filters);
    return {
      lines: filtersResult.lines,
      filters: filtersResult.filters,
    };
  }, [lines, filters, hideUnfiltered]);

  const sortedLines = useMemo(() => {
    return sortLines(
      sortBy,
      project.sortDirection,
      filteredLines.lines,
      logFiles
    );
  }, [filteredLines, sortBy, logFiles, project.sortDirection]);

  const data = useMemo<LogLinesContextType>(
    () => ({
      logFiles,
      lines: sortedLines,
      mergeLogFiles,
      apliedFilters: filteredLines.filters,
      updateLogFile,
      logsAreInSync,
    }),
    [
      logFiles,
      sortedLines,
      mergeLogFiles,
      filteredLines.filters,
      updateLogFile,
      logsAreInSync,
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
