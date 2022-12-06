import "./App.css";
import {
  DateFilterContextProvider,
  LogLinesContextProvider,
} from "./context/LogLinesContext";
import {
  FilesProvider,
  ShowToastToPromptPWAInstall,
} from "./context/FileContext";
import DropFileZone from "./components/DropFileZone";
import ProjectFileContextProvider from "./context/ProjectFileContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApplyTheme } from "./components/useThemeActions";
import { LogViewer } from "./LogViewer";
import { KeyboardShortCuts } from "./components/KeyboardShortCuts";
import { GlobalModals } from "./components/GlobalModals";
import { LogViewerErrorBoundary } from "./components/ErrorBoundary";

function App() {
  useApplyTheme();
  return (
    <LogViewerErrorBoundary>
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
                  <LogViewer />
                  <KeyboardShortCuts />
                  <GlobalModals />
                  <ShowToastToPromptPWAInstall />
                </DropFileZone>
              </LogLinesContextProvider>
            </DateFilterContextProvider>
          </ProjectFileContextProvider>
        </FilesProvider>
      </>
    </LogViewerErrorBoundary>
  );
}

export default App;
