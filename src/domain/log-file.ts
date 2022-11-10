import { getFileColor, TextFilev2 } from "./file-handling";
import { ILogFile, LogLine, SortDirection } from "./types";
import { v4 as uuidv4 } from "uuid";
import { extractLineDate } from "./date-parsing";
import * as Comlink from "comlink";
import type { LogFilesServiceWorker } from "./log-file-service-worker";

const WORKER_URL = new URL("./log-file-service-worker", import.meta.url);

async function initWorker() {
  const worker = new Worker(WORKER_URL, {
    type: "module",
  });
  // WebWorkers use `postMessage` and therefore work with Comlink.
  const obj = Comlink.wrap<LogFilesServiceWorker>(worker);
  return obj;
}

class LogFile implements ILogFile {
  public id: string;
  public color: string;
  private lines?: LogLine[];
  private _sorted: "asc" | "desc" | null = null;
  private _linesWithoutDateCount?: number;
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

  private async getWorker() {
    return await initWorker();
  }

  public getLogLines(): Promise<LogLine[]> {
    return new Promise<LogLine[]>(async (resolve) => {
      if (!this.hasBeenProcessed()) {
        const result = await this.extractLogLines();
        console.log(result);
        this.lines = result.lines;
      } else {
        console.log("using cached log lines");
      }
      resolve(this.lines ?? []);
    });
  }

  public getLinesWithoutDateCount() {
    return new Promise<number>(async (resolve) => {
      if (!this.hasBeenProcessed()) {
        const result = await this.extractLogLines();
        this._linesWithoutDateCount = result.linesWithoutDateCount;
      }
      resolve(this._linesWithoutDateCount ?? 0);
    });
  }

  public getFileSortDirection() {
    return new Promise<SortDirection>(async (resolve) => {
      if (!this.hasBeenProcessed()) {
        const result = await this.extractLogLines();
        this._sorted = result.sorted;
      }
      resolve(this._sorted);
    });
  }

  private hasBeenProcessed() {
    return this.lines != null;
  }
  /**
   * Will extract and process log lines from text
   */
  private async extractLogLines(): Promise<{
    lines: LogLine[];
    linesWithoutDateCount: number;
    sorted: "asc" | "desc" | null;
  }> {
    const worker = await this.getWorker();
    return worker.extractLogLines({
      text: this.text,
      fileId: this.id,
      fileName: this.name,
      color: this.color,
    });
  }
}

export function makeLogFile(file: TextFilev2): ILogFile {
  return new LogFile(file.name, file.content, 0, true, file.fileHandle);
}
