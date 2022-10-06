import { CogIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { AppSettingsModal } from "./AppSettings";
import { Button } from "./Button";
import FilterForm from "./FilterForm";
import { OpenFilesInput } from "./LoadFiles";
import { useProjectFileContext } from "../context/ProjectFileContext";

export function Toolbar() {
  const { project, updateProject: setProjectProperty } =
    useProjectFileContext();
  const { showOGDate, hideUnfiltered } = project;
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div data-tid="toolbar" className="toolbar flex justify-between w-full">
      <div className="flex gap-2">
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
          <input
            id="Sort By Date"
            type="radio"
            name="sort"
            value="date"
            className="p-1"
            onClick={(e) => {
              setProjectProperty({ sortBy: (e.target as any).value });
            }}
          ></input>
          <label htmlFor="Sort By Date" className="p-1">
            Sort By Date
          </label>
        </div>
        <div>
          <input
            id="Sort By File"
            type="radio"
            name="sort"
            value="file"
            className="p-1"
            onClick={(e) => {
              setProjectProperty({ sortBy: (e.target as any).value });
            }}
          ></input>
          <label htmlFor="Sort By File" className="p-1">
            Sort By File
          </label>
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
}
