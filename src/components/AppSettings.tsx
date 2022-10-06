import React from "react";
import { withModal } from "./withModal";
import { LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import { Helmet } from "react-helmet";
import ManageTaTFilters from "./ManageTaTFilters";
import { useProjectFileContext } from "../context/ProjectFileContext";
const appShortName = "RLA";

export default function AppSettings() {
  const { project, setProject } = useProjectFileContext();

  return (
    <div>
      <span>AppSettings</span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          const projectName = data.get("projectName") as string | undefined;
          if (projectName != null) {
            setProject({ ...project, name: projectName });
          }
          form.reset();
        }}
      >
        <div className="p-2 border">
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
          <Button type="submit">Save</Button>
        </div>
        <div className="p-2 border">
          <ManageTaTFilters
            projectName={project.name === "" ? "filters" : project.name}
          />
        </div>
      </form>
      <Helmet>
        <title>{`${project.name} : ${appShortName}`}</title>
      </Helmet>
    </div>
  );
}

export const AppSettingsModal = withModal(<AppSettings />);
