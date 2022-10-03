import React, { useState } from "react";
import { withModal } from "./withModal";
import { LabeledTextField } from "./LabeledTextField";
import { Button } from "./Button";
import { Helmet } from "react-helmet";
import ManageTaTFilters from "./ManageTaTFilters";
const appShortName = "RLA";

export default function AppSettings() {
  const [projectName, setProjectName] = useState("");
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
            setProjectName(projectName);
          }
          form.reset();
        }}
      >
        <div className="p-2 border">
          <LabeledTextField
            label="Project Name"
            inputProps={{ name: "projectName", defaultValue: projectName }}
          />
          <Button type="submit">Save</Button>
        </div>
        <div className="p-2 border">
          <ManageTaTFilters />
        </div>
      </form>
      <Helmet>
        <title>{`${projectName} : ${appShortName}`}</title>
      </Helmet>
    </div>
  );
}

export const AppSettingsModal = withModal(<AppSettings />);
