import React, { useEffect, useMemo, useState } from "react";
import {
  dedupeLogLines,
  LogLine,
  searchLines,
  sortLines,
} from "../domain/log-lines-domain";
import { useFilesContext } from "./FileContext";

export type LogFilesContextType = {
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
  getLineColorByFilter: (line: LogLine) => string;
  hideUnfiltered: boolean;
  setHideUnfiltered: (hideUnfiltered: boolean) => void;
  sortBy: "date" | "file";
  setSortBy: (sortBy: "date" | "file") => void;
  showOGDate: boolean;
  setShowOGDate: (showOGDate: boolean) => void;
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

export type Filter = {
  id: string;
  filter: string;
  color: string;
  isDisabled?: boolean;
  excluding?: boolean;
  hitCount: number;
  description?: string;
  type?: string;
};

export type LogFile = {
  name: string;
  color: string;
  text: string;
  lines: LogLine[];
  timezone: number;
  linesWithoutDateCount: number;
  isVisible: boolean;
};

export const LogFilesContext = React.createContext<LogFilesContextType>({
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
  getLineColorByFilter: () => "white",
  hideUnfiltered: false,
  setHideUnfiltered: () => {},
  sortBy: "file",
  setSortBy: () => {},
  updateFilterPriority: () => {},
  showOGDate: false,
  setShowOGDate: () => {},
  updateFilter: () => {},
});

const MemoComponent = React.memo(({ children }: any) => children);

export const LogFilesContextProvider = ({ children }: any) => {
  const { start, end } = React.useContext(DateFilterContext);
  const [showOGDate, setShowOGDate] = useState(false);
  const [logsAreInSync, setLogsAreInSync] = useState(true);
  const [sortBy, setsortBy] = useState<"date" | "file">("date");
  const [hideUnfiltered, sethideUnfiltered] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [lines, setLines] = React.useState<LogLine[]>([]);

  const { logFiles, updateLogFile } = useFilesContext();

  const setShowOGDateCb = React.useCallback(
    (showOGDate: boolean) => {
      setShowOGDate(showOGDate);
      setLogsAreInSync(false);
    },
    [setShowOGDate, setLogsAreInSync]
  );

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

  const setSortByCb = React.useCallback(
    (sortBy: "date" | "file") => setsortBy(sortBy),
    [setsortBy]
  );

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

  const getLineColorByFilter = React.useCallback(
    (line: LogLine) => {
      for (let filter of filters) {
        if (!filter.isDisabled) {
          if (line.text.toLowerCase().includes(filter.filter.toLowerCase())) {
            return filter.color;
          }
        }
      }
      return "white";
    },
    [filters]
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
  const setHideUnfilteredExternal = React.useCallback(
    (value: boolean) => {
      sethideUnfiltered(value);
    },
    [sethideUnfiltered]
  );
  const filteredLines = useMemo(() => {
    const filtersResult = searchLines(
      lines,
      hideUnfiltered,
      filters,
      start,
      end
    );

    return filtersResult;
  }, [lines, filters, hideUnfiltered, start, end]);

  const sortedLines = useMemo(() => {
    return sortLines(sortBy, filteredLines.lines);
  }, [filteredLines, sortBy]);

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
      getLineColorByFilter,
      setHideUnfiltered: setHideUnfilteredExternal,
      hideUnfiltered,
      sortBy,
      setSortBy: setSortByCb,
      updateLogFile,
      updateFilterPriority,
      logsAreInSync,
      showOGDate,
      setShowOGDate: setShowOGDateCb,
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
      getLineColorByFilter,
      setHideUnfilteredExternal,
      hideUnfiltered,
      setSortByCb,
      sortBy,
      updateFilterPriority,
      updateLogFile,
      logsAreInSync,
      showOGDate,
      setShowOGDateCb,
      updateFilter,
      setFiltersCb,
    ]
  );
  return (
    <LogFilesContext.Provider value={data}>
      <MemoComponent>{children}</MemoComponent>
    </LogFilesContext.Provider>
  );
};

export function useLogFilesContext() {
  return React.useContext(LogFilesContext);
}
