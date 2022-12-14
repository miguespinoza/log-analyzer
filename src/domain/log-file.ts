import { getFileColor, TextFilev2 } from "./file-handling";
import { ILogFile, LogLine, SortDirection } from "./types";
import { v4 as uuidv4, v5 as uuidHash } from "uuid";
import {
  doesLogLineHasTimezonInfo,
  extractLineDate,
  removeOriginalDate,
} from "./date-parsing";

const NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

class LogFile implements ILogFile {
  public id: string;
  public color: string;
  private lines?: LogLine[];
  private _sorted: "asc" | "desc" | null = null;
  private _linesWithoutDateCount?: number;
  private _linesWithDateCount?: number;
  private _linesCount?: number;
  private _hasTimezoneInfo?: boolean;

  constructor(
    public name: string,
    public text: string,
    public timezone: number,
    public isVisible: boolean,
    public fileHandle?: FileSystemFileHandle
  ) {
    this.id = uuidv4();
    this.color = getFileColor();
  }

  public getLogLines = () => {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    } else {
      console.log("using cached log lines");
    }
    return this.lines ?? [];
  };

  public getLinesWithoutDateCount = () => {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    }
    return this._linesWithoutDateCount;
  };

  public getLinesWithDateCount(): number | undefined {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    }
    return this._linesWithDateCount;
  }

  public getLinesCount = () => {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    }
    return this._linesCount;
  };

  public getSortDirection = () => {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    }
    return this._sorted;
  };

  public getHasTimezoneInfo = () => {
    if (!this.hasBeenProcessed()) {
      this.extractLogLines();
    }
    return this._hasTimezoneInfo ?? false;
  };

  public updateTimezone = (timezoneOffset: number) => {
    this.timezone = timezoneOffset;
    this.extractLogLines();
  };

  private hasBeenProcessed = () => {
    return this.lines != null;
  };
  /**
   * Will extract and process log lines from text
   */
  private extractLogLines = () => {
    console.time(`processing file ${this.name}`);
    const { lines, linesWithoutDateCount, sorted } = this.parseLogLines({
      text: this.text,
      fileId: this.id,
      fileName: this.name,
      color: this.color,
      timezoneOffset: this.timezone,
    });
    console.timeEnd(`processing file ${this.name}`);

    this.lines = lines;
    this._linesWithoutDateCount = linesWithoutDateCount;
    this._linesCount = lines.length;
    this._sorted = sorted;
    this.setHasTimezoneInfo();
  };

  private setHasTimezoneInfo = () => {
    if (this.lines && this.lines.length > 0) {
      const firstLineWithDate = this.lines.find((line) => line.date != null);
      if (firstLineWithDate) {
        this._hasTimezoneInfo = doesLogLineHasTimezonInfo(
          firstLineWithDate.text
        );
      }
    }
  };

  // do not access in this method this.lineswithoutDateCount directly, or this.sorted it would create an infinite loop
  private parseLogLines: ParseLogLinesFunction = ({
    text,
    fileId,
    fileName,
    color,
    timezoneOffset,
  }) => {
    const lines = this.separateLogLines(text);
    const logLines: LogLine[] = [];
    let count = 0;
    let linesWithoutDateCount = 0;
    let linesWithDateCount = 0;
    for (const line of lines) {
      count++;
      const date = this.getLineDate(line, timezoneOffset);
      if (date) {
        logLines.push({
          id: uuidv4(),
          fileId,
          hash: uuidHash(line, NAMESPACE),
          date,
          count,
          fileName,
          text: line,
          textWithoutDate: removeOriginalDate(line),
          fileColor: color,
        });
        linesWithDateCount++;
      } else {
        linesWithoutDateCount++;
        logLines.push({
          id: uuidv4(),
          fileId,
          hash: uuidHash(line, NAMESPACE),
          date: null,
          count,
          fileName,
          text: line,
          textWithoutDate: removeOriginalDate(line),
          fileColor: color,
        });
      }
    }
    return {
      lines: logLines,
      linesWithoutDateCount,
      linesWithDateCount,
      sorted: this.areLinesSortedAscOrDesc(logLines),
    };
  };

  private separateLogLines: (text: string) => string[] = (text) => {
    const rawLines = this.splitTextByLines(text);
    const logLines = [];
    let processedLinesCount = 0;
    for (const line of rawLines) {
      if (this.isNewLogLine(line)) {
        logLines.push(line);
        processedLinesCount++;
      } else {
        if (logLines[logLines.length - 1]) {
          logLines[logLines.length - 1] += `\n${line}`;
          if (this.isEmptyOrhasOnlySpaces(line)) {
            processedLinesCount++;
          }
        } else {
          if (this.isEmptyOrhasOnlySpaces(line)) {
            processedLinesCount++;
          }
          logLines.push(line);
        }
      }
    }
    if (processedLinesCount / rawLines.length < 0.5) {
      console.log("too many lines were not parsed, returning raw lines");
      return rawLines;
    }
    return logLines;
  };

  private areLinesSortedAscOrDesc: (lines: LogLine[]) => SortDirection = (
    lines
  ) => {
    if (lines.length < 2) {
      return null;
    }
    const firstLineWithDate = lines.find((line) => line.date !== null);
    let lastLineWithDate = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].date !== null) {
        lastLineWithDate = lines[i];
        break;
      }
    }
    if (!firstLineWithDate || !lastLineWithDate) {
      return null;
    }
    if (firstLineWithDate.date && lastLineWithDate.date) {
      if (firstLineWithDate.date < lastLineWithDate.date) {
        return "asc";
      } else {
        return "desc";
      }
    }
    return null;
  };

  private splitTextByLines: (text: string) => string[] = (text) => {
    return text.split(/\r?\n/);
  };

  private isEmptyOrhasOnlySpaces: (text: string) => boolean = (text) => {
    return text.trim().length === 0;
  };

  private getLineDate: (line: string, fileTimeZone?: number) => Date | null = (
    line,
    fileTimeZone = 0
  ) => {
    return extractLineDate(line, fileTimeZone);
  };

  private isNewLogLine: (line: string) => boolean = (line) => {
    const date = this.getLineDate(line);
    return date !== null && !isNaN(date.getTime());
  };
}

export function makeLogFile(file: TextFilev2): ILogFile {
  return new LogFile(file.name, file.content, 0, true, file.fileHandle);
}

type ParseLogLinesFunction = (params: {
  text: string;
  fileName: string;
  color: string;
  fileId: string;
  timezoneOffset: number;
}) => {
  lines: LogLine[];
  linesWithoutDateCount: number;
  linesWithDateCount: number;
  sorted: "asc" | "desc" | null;
};
