import React, { useState } from "react";
import { MemoComponent } from "./MemoComponent";

type ProjectType = {
  name: string;
};

type ProjectFileContextType = {
  filtersFile?: FileSystemFileHandle;
  setFiltersFile: (file: FileSystemFileHandle) => void;
  project: ProjectType;
  setProject: (project: ProjectType) => void;
};

const ProjectFileContext = React.createContext<ProjectFileContextType>({
  setFiltersFile: () => {},
  project: { name: "" },
  setProject: () => {},
});

export const useProjectFileContext = () => React.useContext(ProjectFileContext);

function getDefaultProject(): ProjectType {
  return {
    name: "",
  };
}

export default function ProjectFileContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filtersFile, setFiltersFile] = useState<FileSystemFileHandle>();
  const [project, setProject] = useState(getDefaultProject());

  const value = React.useMemo(
    () => ({ filtersFile, setFiltersFile, project, setProject }),
    [filtersFile, setFiltersFile, project, setProject]
  );
  return (
    <ProjectFileContext.Provider value={value}>
      <MemoComponent>{children}</MemoComponent>
    </ProjectFileContext.Provider>
  );
}
