import "./App.css";
import LoadFiles from "./components/LoadFiles";
import {
  DateFilterContextProvider,
  LogLinesContextProvider,
} from "./context/LogLinesContext";
import { LinesRenderer } from "./components/LinesRenderer";
import { Filters } from "./components/Filters";
import { KeyboardShortCuts } from "./components/KeyboardShortCuts";
import {
  FilesProvider,
  ShowToastToPromptPWAInstall,
} from "./context/FileContext";
import { Toolbar } from "./components/Toolbar";
import DropFileZone from "./components/DropFileZone";
import ProjectFileContextProvider from "./context/ProjectFileContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApplyTheme } from "./components/useThemeActions";
import StatusBar from "./components/StatusBar";

function App() {
  useApplyTheme();
  return (
    <>
      <ToastContainer
        hideProgressBar
        autoClose={3000}
        theme="dark"
      ></ToastContainer>
      <FilesProvider>
        <ProjectFileContextProvider>
          <DateFilterContextProvider>
            <LogLinesContextProvider>
              <DropFileZone>
                <div
                  id="App"
                  className="App min-h-screen bg-white dark:bg-[#011627]"
                >
                  <ShowToastToPromptPWAInstall />
                  <LoadFiles />
                  <Filters />
                  <Toolbar />
                  <LinesRenderer></LinesRenderer>
                  <StatusBar />
                  <KeyboardShortCuts />
                </div>
              </DropFileZone>
            </LogLinesContextProvider>
          </DateFilterContextProvider>
        </ProjectFileContextProvider>
      </FilesProvider>
    </>
  );
}

export default App;
