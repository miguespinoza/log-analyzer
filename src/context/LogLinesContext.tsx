import React, { useCallback, useMemo, useState } from "react";
import {
  dedupeLogLines,
  processFileLogLines,
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
  allLines: LogLine[];
  updateLogFile: (file: LogFile) => void;
  updateFileTimezone: (file: LogFile, timezone: number) => void;
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
  const [lines, setLines] = React.useState<LogLine[]>([]);
  const { logFiles, updateLogFile } = useFilesContext();
  const { project, filters } = useProjectFileContext();
  const { hideUnfiltered, sortBy } = project;

  React.useEffect(() => {
    const mergedLines = dedupeLogLines(logFiles.filter((f) => f.isVisible));
    setLines(sortLines(sortBy, project.sortDirection, mergedLines, logFiles));
  }, [logFiles, sortBy, project.sortDirection]);

  const filteredLines = useMemo(() => {
    const filtersResult = searchLines(lines, hideUnfiltered, filters);
    return {
      lines: filtersResult.lines,
      filters: filtersResult.filters,
    };
  }, [lines, filters, hideUnfiltered]);

  const updateFileTimezone = useCallback(
    (file: LogFile, newTimezone: number) => {
      const newFile = { ...file, timezone: newTimezone };
      const processedFile = processFileLogLines(newFile);
      updateLogFile(processedFile);
    },
    [updateLogFile]
  );

  // TODO: this second sort can be avoided because we already sort the lines when we merge them, create a test to compare results if same remove this
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
      allLines: lines,
      lines: sortedLines,
      apliedFilters: filteredLines.filters,
      updateLogFile,
      updateFileTimezone,
    }),
    [
      logFiles,
      lines,
      sortedLines,
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
