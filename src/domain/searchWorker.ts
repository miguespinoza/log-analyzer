import * as Comlink from "comlink";
import { LogLine } from "./types";
import lunr from "lunr";

export interface SearchWorker {
  makeIndex(lines: LogLine[]): Boolean;
  search(query: string): LogLine[];
}

class Search {
  private index: lunr.Index | null;
  private linesMap: Map<string, LogLine>;
  constructor() {
    this.index = null;
    this.linesMap = new Map();
  }
  makeIndex(lines: LogLine[]) {
    this.index = null;
    this.linesMap = new Map();
    console.time("makeIndex");
    this.index = lunr(function () {
      this.ref("id");
      this.field("text");

      lines.forEach((line) => {
        this.add(line);
      });
    });
    console.timeEnd("makeIndex");
    console.time("makeMap");
    lines.forEach((line) => {
      this.linesMap.set(line.id, line);
    });
    console.timeEnd("makeMap");

    return true;
  }
  search(query: string) {
    console.log("search");
    if (!this.index) {
      console.error("Index not initialized");
      return [];
    }
    const result = this.index.search(query);
    console.log(result);
    const res = result.map((result) => {
      const line = this.linesMap.get(result.ref)!;
      return line;
    });

    return res;
  }
}

Comlink.expose(new Search());
