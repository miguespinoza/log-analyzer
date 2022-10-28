import { expose } from "comlink";
import { LogLine } from "../domain/types";
import lunr from "lunr";

export interface ISearchWorker {
  makeIndex: (lines: LogLine[]) => Promise<string>;
  search: (query: string) => Promise<lunr.Index.Result[]>;
}

class SearchWorker implements ISearchWorker {
  private index?: lunr.Index;

  makeIndex = async (lines: LogLine[]) => {
    console.time("createSearchIndex");
    const index = lunr(function () {
      this.ref("id");
      this.field("text");

      lines.forEach((line) => {
        this.add(line);
      });
    });
    console.timeEnd("createSearchIndex");

    this.index = index;
    return "ok";
  };

  search = async (query: string) => {
    if (!this.index) {
      console.error("Index not initialized");
      return [];
    }
    console.time("search");
    const results = this.index?.search(query);
    console.timeEnd("search");

    return [];
  };
}

expose(SearchWorker);
