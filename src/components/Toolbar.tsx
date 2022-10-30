import { CogIcon } from "@heroicons/react/24/solid";
import React, { forwardRef, useState } from "react";
import { AppSettingsModal } from "./AppSettings";
import { Button } from "./Button";
import FilterForm from "./FilterForm";
import { OpenFilesInput } from "./LoadFiles";
import { useProjectFileContext } from "../context/ProjectFileContext";

export const Toolbar = forwardRef<HTMLDivElement>((props, ref) => {
  const { project, updateProject: setProjectProperty } =
    useProjectFileContext();
  const { showOGDate, hideUnfiltered } = project;
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div
      ref={ref}
      data-tid="toolbar"
      className=" toolbar flex justify-between w-full border dark:border-cyan-800 items-center"
    >
      <div className="flex gap-2 items-center">
        <Button
          title="ctl+alt+h"
          onClick={() =>
            setProjectProperty({ hideUnfiltered: !hideUnfiltered })
          }
          look={hideUnfiltered ? "primary" : "destructive"}
        >
          {hideUnfiltered ? "Show" : "Hide"} Lines
        </Button>
        <FilterForm />
        <div>
          <input
            id="showOGdate"
            type="checkbox"
            onChange={(e) => {
              setProjectProperty({ showOGDate: e.target.checked });
            }}
            checked={showOGDate}
            className="p-1"
          ></input>
          <label htmlFor="showOGdate" className="p-1">
            Show Original Date
          </label>
        </div>
        <div>
          <label htmlFor="sortBy">Sort By:</label>
          <select
            className="rounded border dark:bg-gray-700 bg-gray-200 px-1 py-1 leading-tight text-gray-700 dark:text-white dark:focus:bg-gray-900 focus:bg-white focus:outline-none"
            id="sortBy"
            onChange={(e) => {
              setProjectProperty({ sortBy: e.target.value as any });
            }}
          >
            <option value="date">Date</option>
            <option value="file">File</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder">Sort order:</label>
          <select
            className="rounded border dark:bg-gray-700 bg-gray-200 px-1 py-1 leading-tight text-gray-700 dark:text-white dark:focus:bg-gray-900 focus:bg-white focus:outline-none"
            id="sortOrder"
            onChange={(e) => {
              setProjectProperty({ sortDirection: e.target.value as any });
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div>
          <Button
            look="secondary"
            title="open settings"
            onClick={() => {
              setShowSettingsModal(!showSettingsModal);
            }}
          >
            <span className="flex gap-1 items-center">
              <CogIcon className="h-4 w-4" /> Settings
            </span>
          </Button>
          <AppSettingsModal
            showModal={showSettingsModal}
            setShowModal={setShowSettingsModal}
          />
        </div>
      </div>
      <OpenFilesInput />
    </div>
  );
});
Toolbar.displayName = "Toolbar";
