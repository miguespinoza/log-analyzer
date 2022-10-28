import React, { useEffect, useMemo, useState } from "react";
import { LogLine } from "../domain/types";
import { LabeledTextField } from "./LabeledTextField";
import lunr from "lunr";
import { useLogLinesContext } from "../context/LogLinesContext";
import { IconButton } from "./IconButton";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { wrap } from "comlink";
import { ISearchWorker } from "../worker/search";

const worker = wrap<ISearchWorker>(
  new Worker(new URL("../worker/search.ts", import.meta.url), {
    type: "module",
  })
);

export function Search() {
  const [isLoading, setIsLoading] = useState(false);
  const { allLines } = useLogLinesContext();

  useEffect(() => {
    worker.makeIndex(allLines).then(console.log).catch(console.error);
  }, [allLines]);

  return (
    <div className="flex flex-col">
      <span className="bg-gray-400 pl-2 pr-2 uppercase">Search</span>
      {isLoading && (
        <div className="w-full h-[3px] bg-blue-500 animate-bounce"></div>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          const formData = new FormData(e.target as HTMLFormElement);
          const query = formData.get("query") as string;
          const results = await worker.search(query ?? "");
          console.log(results);
          setIsLoading(false);
        }}
        className="w-full flex"
      >
        <LabeledTextField
          containerProps={{ className: "flex-grow" }}
          inputProps={{ name: "query", className: "w-full p-2" }}
        />
        <IconButton
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
          type="submit"
        />
      </form>
    </div>
  );
}

function createSearchIndex(lines: LogLine[]) {
  console.time("createSearchIndex");
  const index = lunr(function () {
    this.ref("id");
    this.field("text");

    lines.forEach((line) => {
      this.add(line);
    });
  });
  console.timeEnd("createSearchIndex");

  return index;
}
