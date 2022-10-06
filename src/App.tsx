import "./App.css";
import LoadFiles from "./components/LoadFiles";
import {
  DateFilterContextProvider,
  LogFilesContextProvider,
} from "./context/LogFilesContext";
import { LinesRenderer } from "./components/LinesRenderer";
import { Filters } from "./components/Filters";
import { KeyboardShortCuts } from "./components/KeyboardShortCuts";
import { FilesProvider } from "./context/FileContext";
import { Toolbar } from "./components/Toolbar";
import DropFileZone from "./components/DropFileZone";
import ProjectFileContextProvider from "./context/ProjectFileContext";

function App() {
  return (
    <FilesProvider>
      <DateFilterContextProvider>
        <LogFilesContextProvider>
          <ProjectFileContextProvider>
            <DropFileZone>
              <div className="App">
                <LoadFiles />
                <Filters />
                <Toolbar />
                <LinesRenderer></LinesRenderer>
                <KeyboardShortCuts />
              </div>
            </DropFileZone>
          </ProjectFileContextProvider>
        </LogFilesContextProvider>
      </DateFilterContextProvider>
    </FilesProvider>
  );
}

export default App;
