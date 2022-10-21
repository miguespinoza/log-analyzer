import React from "react";
import { withModal } from "./withModal";
import { LabeledSelectField, LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import { Helmet } from "react-helmet";
import ManageTaTFilters from "./ManageTaTFilters";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { useThemeActions } from "./useThemeActions";
import { timezones } from "../domain/timezone";
import { toast } from "react-toastify";
const appShortName = "RLA";

export default function AppSettings() {
  const { project, updateProject } = useProjectFileContext();
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
          const displayTimezone = data.get("displayTimezone") as
            | string
            | undefined;
          const theme = data.get("theme") as string | undefined;
          if (theme != null && theme !== getTheme()) {
            setTheme(theme as "light" | "dark");
          }

          if (projectName != null && displayTimezone != null) {
            updateProject({
              name: projectName,
              displayTimezone: Number(displayTimezone),
            });
          } else {
            toast.error("Invalid form data");
          }
          form.reset();
        }}
      >
        <div className="p-2 border dark:border-cyan-800 flex flex-col gap-1">
          <LabeledTextField
            label="Project Name"
            containerProps={{ className: "w-full flex justify-between" }}
            inputProps={{ name: "projectName", defaultValue: project.name }}
          />
          <LabeledTextField
            label="Create Quick Filter Shortcut"
            containerProps={{ className: "w-full flex justify-between" }}
            inputProps={{
              name: "createFilterSC",
              defaultValue: "ctrl+alt+f",
              disabled: true,
            }}
          />
          <LabeledTextField
            label="Show/hide Shortcut"
            containerProps={{ className: "w-full flex justify-between" }}
            inputProps={{
              name: "createFilterSC",
              defaultValue: "ctrl+alt+h",
              disabled: true,
            }}
          />
          <LabeledSelectField
            label="Theme"
            containerProps={{ className: "w-full flex justify-between" }}
            selectProps={{ name: "theme", defaultValue: getTheme() }}
            options={[
              { value: "light", renderer: "Light" },
              { value: "dark", renderer: "Dark" },
            ]}
          />
          <LabeledSelectField
            label="Display timezone"
            containerProps={{ className: "w-full flex justify-between" }}
            selectProps={{
              title:
                "Use this setting to change the timezone the log lines will be rendered with",
              name: "displayTimezone",
              defaultValue: project.displayTimezone.toString(),
            }}
            options={timezones.map((tz) => ({
              value: tz.offset.toString(),
              renderer: tz.name,
            }))}
          />
          <Button type="submit">Apply Settings</Button>
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
