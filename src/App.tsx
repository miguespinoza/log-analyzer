import "./App.css";
import LoadFiles from "./components/LoadFiles";
import {
  DateFilterContextProvider,
  LogLinesContextProvider,
} from "./context/LogLinesContext";
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
        <LogLinesContextProvider>
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
        </LogLinesContextProvider>
      </DateFilterContextProvider>
    </FilesProvider>
  );
}

export default App;
