import React, { useCallback, useEffect } from "react";
import type { SearchWorker } from "../domain/searchWorker";
import * as Comlink from "comlink";
import { useLogLinesContext } from "../context/LogLinesContext";
import { LabeledTextField } from "./LabeledTextField";
import useDebouncedCallback from "../domain/useDebouncedCallback";
import { LogLine } from "../domain/types";

const WORKER_URL = new URL("../domain/searchWorker.ts", import.meta.url);

function initWorker() {
  const worker = new Worker(WORKER_URL, { type: "module" });
  // WebWorkers use `postMessage` and therefore work with Comlink.
  const obj = Comlink.wrap<SearchWorker>(worker);
  return obj;
}

const searchWorker = initWorker();

export default function SearchPanel() {
  const { lines } = useLogLinesContext();
  const [searchResults, setSearchResults] = React.useState<LogLine[]>([]);
  useEffect(() => {
    searchWorker.makeIndex(lines);
  }, [lines]);

  const onSearch = useCallback(
    (query: string) => {
      searchWorker.search(query).then((results) => {
        console.log(results);
        setSearchResults(results);
      });
    },
    [setSearchResults]
  );

  const onSearchDebounced = useDebouncedCallback(onSearch as any, 300);

  return (
    <div>
      <span>Search</span>
      <LabeledTextField
        label="Search"
        inputProps={{
          onChange: (e) => {
            const query = e.target.value;
            if (query.length > 2) {
              onSearchDebounced(query);
            }
          },
        }}
      />
      {searchResults.map((line) => (
        <span>{line.text}</span>
      ))}
    </div>
  );
}
