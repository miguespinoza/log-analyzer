export type LogFile = {
  name: string;
  color: string;
  fileHandle?: FileSystemFileHandle;
  text: string;
  lines: LogLine[];
  timezone: number;
  linesWithoutDateCount: number;
  isVisible: boolean;
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
