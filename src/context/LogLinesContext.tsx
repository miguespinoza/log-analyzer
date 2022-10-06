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
  logsAreInSync: boolean;
  filters: Filter[];
  setFilter: (filter: Filter) => void;
  setFilters: (filters: Filter[]) => void;
  removeFilter: (filter: string) => void;
  disableFilter: (filter: string) => void;
  enableFilter: (filter: string) => void;
  updateFilter: (filter: Filter) => void;
  updateFilterPriority: (filter: Filter, delta: number) => void;
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
  filters: [],
  setFilter: () => {},
  setFilters: () => {},
  removeFilter: () => {},
  disableFilter: () => {},
  enableFilter: () => {},
  updateFilterPriority: () => {},
  updateFilter: () => {},
});

export const LogLinesContextProvider = ({ children }: any) => {
  const [logsAreInSync, setLogsAreInSync] = useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [lines, setLines] = React.useState<LogLine[]>([]);
  const { logFiles, updateLogFile } = useFilesContext();
  const { project } = useProjectFileContext();
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

  const setFilter = React.useCallback(
    (filter: Filter) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        filters[index] = filter;
        setFilters([...filters]);
      } else {
        setFilters([...filters, filter]);
      }
    },
    [setFilters, filters]
  );
  const setFiltersCb = React.useCallback(
    (newFilters: Filter[]) => {
      setFilters([...filters, ...newFilters]);
    },
    [setFilters, filters]
  );

  const removeFilter = React.useCallback(
    (filterId: string) => {
      setFilters(filters.filter((f) => f.id !== filterId));
    },
    [setFilters, filters]
  );

  const disableFilter = React.useCallback(
    (filterString: string) => {
      const filter = filters.find((f) => f.filter === filterString);
      if (filter) {
        filter.isDisabled = true;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );

  const updateFilter = React.useCallback(
    (filter: Filter) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        // replace the filter at index with the new filter
        filters[index] = filter;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );

  const updateFilterPriority = React.useCallback(
    (filter: Filter, delta: number) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        const filter = filters[index];
        filters.splice(index, 1); // delete from current space
        filters.splice(index + delta, 0, filter); // insert at new space
        setFilters([...filters]); // save
      }
    },
    [filters, setFilters]
  );
  const enableFilter = React.useCallback(
    (filterString: string) => {
      const filter = filters.find((f) => f.filter === filterString);
      if (filter) {
        filter.isDisabled = false;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );

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

  const data = useMemo(
    () => ({
      logFiles,
      lines: sortedLines,
      mergeLogFiles,
      filters: filteredLines.filters,
      setFilter,
      removeFilter,
      disableFilter,
      enableFilter,
      updateLogFile,
      updateFilterPriority,
      logsAreInSync,
      updateFilter,
      setFilters: setFiltersCb,
    }),
    [
      logFiles,
      sortedLines,
      mergeLogFiles,
      filteredLines.filters,
      setFilter,
      removeFilter,
      disableFilter,
      enableFilter,
      updateFilterPriority,
      updateLogFile,
      logsAreInSync,
      updateFilter,
      setFiltersCb,
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
