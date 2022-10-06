import React, { useCallback, useState } from "react";
import { MemoComponent } from "../components/MemoComponent";

type ProjectType = {
  name: string;
  sortBy: "date" | "file";
  sortDirection: "asc" | "desc";
  showOGDate: boolean;
  hideUnfiltered: boolean;
};

type ProjectFileContextType = {
  filtersFile?: FileSystemFileHandle;
  setFiltersFile: (file: FileSystemFileHandle) => void;
  project: ProjectType;
  setProject: (project: ProjectType) => void;
  updateProject: (value: Partial<ProjectType>) => void;
};

const ProjectFileContext = React.createContext<ProjectFileContextType>({
  setFiltersFile: () => {},
  project: getDefaultProject(),
  setProject: () => {},
  updateProject: () => {},
});

export const useProjectFileContext = () => React.useContext(ProjectFileContext);

function getDefaultProject(): ProjectType {
  return {
    name: "",
    sortBy: "date",
    sortDirection: "desc",
    showOGDate: false,
    hideUnfiltered: false,
  };
}

export default function ProjectFileContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filtersFile, setFiltersFile] = useState<FileSystemFileHandle>();
  const [project, setProject] = useState(getDefaultProject());

  const updateProject = useCallback(
    (value: Partial<ProjectType>) => {
      setProject((project) => ({ ...project, ...value }));
    },
    [setProject]
  );

  const value = React.useMemo(
    () => ({
      filtersFile,
      setFiltersFile,
      project,
      setProject,
      updateProject,
    }),
    [filtersFile, setFiltersFile, project, setProject, updateProject]
  );
  return (
    <ProjectFileContext.Provider value={value}>
      <MemoComponent>{children}</MemoComponent>
    </ProjectFileContext.Provider>
  );
}
