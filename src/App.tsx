import "./App.css";
import LoadFiles from "./components/LoadFiles";
import {
  DateFilterContextProvider,
  LogFilesContextProvider,
} from "./components/LogFilesContext";
import { LinesRenderer } from "./components/LinesRenderer";
import { Filters } from "./components/Filters";
import { KeyboardShortCuts } from "./components/KeyboardShortCuts";
import { FilesProvider } from "./components/FileContext";
import { Toolbar } from "./components/Toolbar";
import DropFileZone from "./components/DropFileZone";

function App() {
  return (
    <FilesProvider>
      <DateFilterContextProvider>
        <LogFilesContextProvider>
          <DropFileZone>
            <div className="App">
              <LoadFiles />
              <Filters />
              <Toolbar />
              <LinesRenderer></LinesRenderer>
              <KeyboardShortCuts />
            </div>
          </DropFileZone>
        </LogFilesContextProvider>
      </DateFilterContextProvider>
    </FilesProvider>
  );
}

export default App;
