import React, { useCallback, useEffect, useRef, useState } from "react";
import { MemoComponent } from "../components/MemoComponent";
import {
  adaptProjectToXML,
  extractFiltersFromXML,
  extractProjectFromXML,
} from "../domain/tat-xml-files";
import { Filter } from "../domain/types";
import { useFilesContext } from "./FileContext";
import {
  downloadFile,
  isFileSystemAPIAvailable,
  saveFile,
  saveFileAs,
  TextFilev2,
} from "../domain/file-handling";
import { TimeHighlight } from "../domain/timeline";

export type ProjectType = {
  name: string;
  sortBy: "date" | "file";
  sortDirection: "asc" | "desc";
  showOGDate: boolean;
  displayTimezone: number;
  hideUnfiltered: boolean;
};

type ProjectFileContextType = {
  filtersFile?: FileSystemFileHandle;
  setFiltersFile: (file: FileSystemFileHandle) => void;
  project: ProjectType;
  setProject: (project: ProjectType) => void;
  updateProject: (value: Partial<ProjectType>) => void;
  // project file
  saveProjectFile: () => void;
  saveProjectFileAs: () => void;
  openProjectFile: (file: TextFilev2) => void;
  // time highlights
  timeHighlights: TimeHighlight[];
  addTimeHighlight: (highlight: TimeHighlight) => void;
  removeTimeHighlight: (highlight: TimeHighlight) => void;
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
  saveProjectFile: () => {},
  saveProjectFileAs: () => {},
  openProjectFile: () => {},
  filters: [],
  setFilter: () => {},
  setFilters: () => {},
  removeFilter: () => {},
  disableFilter: () => {},
  enableFilter: () => {},
  updateFilterPriority: () => {},
  updateFilter: () => {},
  timeHighlights: [],
  addTimeHighlight: () => {},
  removeTimeHighlight: () => {},
});

export const useProjectFileContext = () => React.useContext(ProjectFileContext);

export function getDefaultProject(name: string = ""): ProjectType {
  return {
    name,
    sortBy: "date",
    sortDirection: "desc",
    showOGDate: false,
    displayTimezone: 0,
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
  const {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    disableFilter,
    enableFilter,
    updateFilter,
    updateFilterPriority,
  } = useFilterControls();

  const saveProjectFile = useCallback(() => {
    const xml = adaptProjectToXML(filters, project);
    if (isFileSystemAPIAvailable()) {
      if (filtersFile) {
        saveFile(filtersFile, xml);
      } else {
        saveFileAs(`${project.name}.tat`, xml);
      }
    } else {
      downloadFile(`${project.name}.tat`, xml, "text/xml");
    }
  }, [filters, filtersFile, project]);

  const saveProjectFileAs = useCallback(() => {
    const xml = adaptProjectToXML(filters, project);
    if (isFileSystemAPIAvailable()) {
      saveFileAs(`${project.name}.tat`, xml);
    } else {
      downloadFile(`${project.name}.tat`, xml, "text/xml");
    }
  }, [filters, project]);

  const openProjectFile = useCallback(
    (xmlFile: TextFilev2) => {
      setFiltersFile(xmlFile.fileHandle);
      try {
        const project = extractProjectFromXML(xmlFile?.content);
        setProject(project);
      } catch (e) {
        const project = getDefaultProject(xmlFile?.name);
        setProject(project);
        console.error(e);
      }
      try {
        const filters = extractFiltersFromXML(xmlFile?.content);
        setFilters(filters.filters);
      } catch (e) {
        console.error(e);
      }
    },
    [setFilters]
  );

  const projectWasOpenedFromFile = useRef(false);
  useEffect(() => {
    if (projectFile && projectWasOpenedFromFile.current === false) {
      openProjectFile(projectFile);
      projectWasOpenedFromFile.current = true;
    }
  }, [projectFile, openProjectFile]);

  const updateProject = useCallback(
    (value: Partial<ProjectType>) => {
      setProject((project) => ({ ...project, ...value }));
    },
    [setProject]
  );

  const [hightlights, setHightlights] = useState<TimeHighlight[]>([]);
  const addTimeHighlight = useCallback(
    (highlight: TimeHighlight) => {
      setHightlights((highlights) => [...highlights, highlight]);
    },
    [setHightlights]
  );
  const removeTimeHighlight = useCallback(
    (highlight: TimeHighlight) => {
      setHightlights((highlights) =>
        highlights.filter((h) => h.id !== highlight.id)
      );
    },
    [setHightlights]
  );

  const value = React.useMemo(
    () => ({
      filtersFile,
      setFiltersFile,
      project,
      setProject,
      updateProject,
      setFilter,
      setFilters,
      removeFilter,
      disableFilter,
      enableFilter,
      updateFilter,
      updateFilterPriority,
      filters,
      // project file
      openProjectFile,
      saveProjectFile,
      saveProjectFileAs,
      // time highlights
      timeHighlights: hightlights,
      addTimeHighlight,
      removeTimeHighlight,
    }),
    [
      filtersFile,
      project,
      updateProject,
      setFilter,
      setFilters,
      removeFilter,
      disableFilter,
      enableFilter,
      updateFilter,
      updateFilterPriority,
      filters,
      saveProjectFile,
      saveProjectFileAs,
      openProjectFile,
      hightlights,
      addTimeHighlight,
      removeTimeHighlight,
    ]
  );
  return (
    <ProjectFileContext.Provider value={value}>
      <MemoComponent>{children}</MemoComponent>
    </ProjectFileContext.Provider>
  );
}

const useFilterControls = () => {
  const [filters, setFilters] = useState<Filter[]>([]);

  const setFilter = useCallback(
    (filter: Filter) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        filters[index] = filter;
        setFilters([...filters]);
      } else {
        setFilters([...filters, filter]);
      }
    },
    [setFilters, filters]
  );
  const setFiltersCb = useCallback(
    (newFilters: Filter[]) => {
      setFilters([...filters, ...newFilters]);
    },
    [setFilters, filters]
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      setFilters(filters.filter((f) => f.id !== filterId));
    },
    [setFilters, filters]
  );

  const disableFilter = useCallback(
    (filterString: string) => {
      const filter = filters.find((f) => f.filter === filterString);
      if (filter) {
        filter.isDisabled = true;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );

  const updateFilter = useCallback(
    (filter: Filter) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        // replace the filter at index with the new filter
        filters[index] = filter;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );

  const updateFilterPriority = useCallback(
    (filter: Filter, delta: number) => {
      const index = filters.findIndex((f) => f.id === filter.id);
      if (index !== -1) {
        const filter = filters[index];
        filters.splice(index, 1); // delete from current space
        filters.splice(index + delta, 0, filter); // insert at new space
        setFilters([...filters]); // save
      }
    },
    [filters, setFilters]
  );
  const enableFilter = useCallback(
    (filterString: string) => {
      const filter = filters.find((f) => f.filter === filterString);
      if (filter) {
        filter.isDisabled = false;
        setFilters([...filters]);
      }
    },
    [setFilters, filters]
  );
  return {
    filters,
    setFilter,
    setFilters: setFiltersCb,
    removeFilter,
    disableFilter,
    enableFilter,
    updateFilter,
    updateFilterPriority,
  };
};
