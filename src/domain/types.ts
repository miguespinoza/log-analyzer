export type LogFile = {
  name: string;
  color: string;
  fileHandle?: FileSystemFileHandle;
  id: string;
  text: string;
  sorted: "asc" | "desc" | null;
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
  fileId: string;
  date: Date | null;
  count: number;
  hash: string;
  fileName: string;
  text: string;
  matchedFilters?: Omit<Filter, "hitCount">;
  isVisible?: boolean;
  fileColor: string;
}
