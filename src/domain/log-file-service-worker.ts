// web worker in charge of processing log files
import { LogLine, SortDirection } from "./types";
import { v4 as uuidv4, v5 as uuidHash } from "uuid";
import { extractLineDate, removeOriginalDate } from "./date-parsing";

import * as Comlink from "comlink";

export interface LogFilesServiceWorker {
  extractLogLines(props: {
    text: string;
    fileName: string;
    color: string;
    fileId: string;
  }): {
    lines: LogLine[];
    linesWithoutDateCount: number;
    sorted: "asc" | "desc" | null;
  };
}

const NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export class LogFilesServiceWorkerImpl implements LogFilesServiceWorker {
  public extractLogLines({
    text,
    fileId,
    fileName,
    color,
  }: {
    text: string;
    fileName: string;
    color: string;
    fileId: string;
  }): {
    lines: LogLine[];
    linesWithoutDateCount: number;
    sorted: "asc" | "desc" | null;
  } {
    console.log("extracting log lines", fileName);
    console.time("extractLogLines");
    const lines = this.separateLogLines(text);
    const logLines: LogLine[] = [];
    let count = 0;
    let linesWithoutDateCount = 0;
    for (const line of lines) {
      count++;
      const date = this.getLineDate(line);
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
    console.timeEnd("extractLogLines");

    return {
      lines: logLines,
      linesWithoutDateCount,
      sorted: this.areLinesSortedAscOrDesc(logLines),
    };
  }

  private separateLogLines(text: string): string[] {
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
  }

  private areLinesSortedAscOrDesc(lines: LogLine[]): SortDirection {
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
  }

  private splitTextByLines(text: string): string[] {
    return text.split(/\r?\n/);
  }

  private isEmptyOrhasOnlySpaces(text: string) {
    return text.trim().length === 0;
  }

  private getLineDate(line: string, fileTimeZone: number = 0) {
    return extractLineDate(line, fileTimeZone);
  }

  private isNewLogLine(line: string) {
    const date = this.getLineDate(line);
    return date !== null && !isNaN(date.getTime());
  }
}

Comlink.expose(new LogFilesServiceWorkerImpl());
