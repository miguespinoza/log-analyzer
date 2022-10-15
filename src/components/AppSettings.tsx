import React, { useCallback, useEffect, useState } from "react";
import { withModal } from "./withModal";
import { LabeledSelectField, LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import { Helmet } from "react-helmet";
import ManageTaTFilters from "./ManageTaTFilters";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { useThemeActions } from "./useThemeActions";
const appShortName = "RLA";

export default function AppSettings() {
  const { project, setProject } = useProjectFileContext();
  const { getTheme, setTheme } = useThemeActions();

  return (
    <div data-tid="settings" className="dark:bg-[#011627] p-2">
      <span>AppSettings</span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          const projectName = data.get("projectName") as string | undefined;
          const theme = data.get("theme") as string | undefined;
          if (theme != null && theme !== getTheme()) {
            setTheme(theme as "light" | "dark");
          }

          if (projectName != null) {
            setProject({ ...project, name: projectName });
          }
          form.reset();
        }}
      >
        <div className="p-2 border dark:border-cyan-800">
          <LabeledTextField
            label="Project Name"
            inputProps={{ name: "projectName", defaultValue: project.name }}
          />
          <LabeledTextField
            label="Create Quick Filter Shortcut"
            inputProps={{
              name: "createFilterSC",
              defaultValue: "ctrl+alt+f",
              disabled: true,
            }}
          />
          <LabeledTextField
            label="Show/hide Shortcut"
            inputProps={{
              name: "createFilterSC",
              defaultValue: "ctrl+alt+h",
              disabled: true,
            }}
          />
          <LabeledSelectField
            label="Theme"
            selectProps={{ name: "theme", defaultValue: getTheme() }}
            options={[
              { value: "light", renderer: "Light" },
              { value: "dark", renderer: "Dark" },
            ]}
          />
          <Button type="submit">Save</Button>
        </div>
        <div className="p-2 border dark:border-cyan-800">
          <ManageTaTFilters />
        </div>
      </form>
      <Helmet>
        <title>{`${project.name} : ${appShortName}`}</title>
      </Helmet>
    </div>
  );
}

export const AppSettingsModal = withModal(AppSettings);
