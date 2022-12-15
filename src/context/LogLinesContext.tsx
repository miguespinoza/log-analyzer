import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LogFilesService } from "../domain/log-files-service";
import { useFilesContext } from "./FileContext";
import { MemoComponent } from "../components/MemoComponent";
import { Filter, ILogFile, LogLine } from "../domain/types";
import { useProjectFileContext } from "./ProjectFileContext";
import { scenarioDiscoveryService } from "../domain/scenario-discovery-service";
import { toast } from "react-toastify";

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

function shouldChangeToSortByDate(logFiles: ILogFile[]) {
  if (logFiles.length > 1 || logFiles.length === 0) return false;
  const linesWithoutDate = logFiles.reduce((acc, file) => {
    const linesWithoutDate = file.getLinesWithoutDateCount() ?? 0;
    return acc + linesWithoutDate;
  }, 0);
  const linesWithDate = logFiles.reduce((acc, file) => {
    const linesWithDate = file
      .getLogLines()
      .filter((line) => line.date != null).length;
    return acc + linesWithDate;
  }, 0);
  return linesWithDate === 0 && linesWithoutDate > 0;
}

export const LogLinesContextProvider = ({ children }: any) => {
  const { logFiles, updateLogFile } = useFilesContext();
  const {
    project,
    filters,
    startDate,
    endDate,
    updateProject: setProjectProperty,
  } = useProjectFileContext();
  const { hideUnfiltered, sortBy } = project;

  // merges and dedupes all log lines from all files
  const mergedLines = React.useMemo(() => {
    return LogFilesService.mergeLogFiles(logFiles.filter((f) => f.isVisible));
  }, [logFiles]);

  useEffect(() => {
    if (shouldChangeToSortByDate(logFiles)) {
      console.log("switching to sort by file");
      toast.info(
        "Switching to sort by file, because the file opended does not have enough date lines"
      );
      setProjectProperty({ sortBy: "file", sortDirection: "asc" });
    }
  }, [logFiles, setProjectProperty]);
  // sorts the lines
  const lines = useMemo(
    () =>
      LogFilesService.sortLogLines(
        sortBy,
        project.sortDirection,
        mergedLines,
        logFiles
      ),
    [mergedLines, logFiles, sortBy, project.sortDirection]
  );

  useEffect(() => scenarioDiscoveryService.indexScenarios(lines), [lines]);

  // filters the sorted lines, no need to re-sort since the lines are already sorted
  const filteredLines = useMemo(() => {
    const filtersResult = LogFilesService.filterLogLines(
      lines,
      filters,
      startDate ?? null,
      endDate ?? null,
      hideUnfiltered
    );
    return {
      lines: filtersResult.lines,
      filters: filtersResult.filters,
    };
  }, [lines, filters, hideUnfiltered, startDate, endDate]);

  const updateFileTimezone = useCallback(
    (file: ILogFile, newTimezone: number) => {
      file.updateTimezone(newTimezone);
      updateLogFile(file);
    },
    [updateLogFile]
  );

  const data = useMemo<LogLinesContextType>(
    () => ({
      logFiles,
      allLines: lines,
      lines: filteredLines.lines,
      apliedFilters: filteredLines.filters,
      updateLogFile,
      updateFileTimezone,
    }),
    [
      logFiles,
      lines,
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
