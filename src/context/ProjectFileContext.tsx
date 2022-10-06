import React, { useCallback, useEffect, useState } from "react";
import { MemoComponent } from "../components/MemoComponent";
import {
  extractFiltersFromXML,
  extractProjectFromXML,
} from "../domain/tat-xml-files";
import { Filter } from "../domain/types";
import { useFilesContext } from "./FileContext";

export type ProjectType = {
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
  // filters
  filters: Filter[];
  setFilter: (filter: Filter) => void;
  setFilters: (filters: Filter[]) => void;
  removeFilter: (filter: string) => void;
  disableFilter: (filter: string) => void;
  enableFilter: (filter: string) => void;
  updateFilter: (filter: Filter) => void;
  updateFilterPriority: (filter: Filter, delta: number) => void;
};

const ProjectFileContext = React.createContext<ProjectFileContextType>({
  setFiltersFile: () => {},
  project: getDefaultProject(),
  setProject: () => {},
  updateProject: () => {},
  filters: [],
  setFilter: () => {},
  setFilters: () => {},
  removeFilter: () => {},
  disableFilter: () => {},
  enableFilter: () => {},
  updateFilterPriority: () => {},
  updateFilter: () => {},
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
  const { projectFile } = useFilesContext();
  const [filtersFile, setFiltersFile] = useState<FileSystemFileHandle>();
  const [project, setProject] = useState(getDefaultProject());

  useEffect(() => {
    if (projectFile) {
      const project = extractProjectFromXML(projectFile?.content);
      setProject(project);
      const filters = extractFiltersFromXML(projectFile?.content);
      setFiltersFile(projectFile.fileHandle);
    }
  }, [projectFile]);

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
