export interface ILogFile {
  name: string;
  color: string;
  id: string;
  text: string;
  timezone: number;
  isVisible: boolean;
  fileHandle?: FileSystemFileHandle;

  getHasTimezoneInfo(): boolean;
  updateTimezone: (timezone: number) => void;
  getSortDirection(): SortDirection;
  getLinesWithoutDateCount(): number | undefined;
  getLinesWithDateCount(): number | undefined;
  getLinesCount(): number | undefined;
  getLogLines(): LogLine[];
}

export type SortDirection = "asc" | "desc" | null;

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
  textWithoutDate: string;
  matchedFilters?: Omit<Filter, "hitCount">;
  isVisible?: boolean;
  fileColor: string;
}
