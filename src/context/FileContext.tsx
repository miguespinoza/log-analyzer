import React, { useEffect, useRef } from "react";
import {
  logFileLoading$,
  isFileSystemAPIAvailable,
  projectFileLoading$,
  TextFilev2,
} from "../domain/file-handling";
import { concatMap, Subscription } from "rxjs";
import { MemoComponent } from "../components/MemoComponent";
import { LogFile } from "../domain/types";
import { toast, ToastOptions } from "react-toastify";

export type LogFilesContextType = {
  logFiles: LogFile[];
  projectFile?: TextFilev2;
  updateLogFile: (file: LogFile) => void;
  removeLogFile: (file: LogFile) => void;
};
const LogFilesContext = React.createContext<LogFilesContextType>({
  logFiles: [],
  updateLogFile: () => {},
  removeLogFile: () => {},
});
export const useFilesContext = () => React.useContext(LogFilesContext);
//class component to provide log file context to the rest of the applicatio

export class FilesProvider extends React.Component<
  { children: React.ReactNode },
  {
    logFiles: LogFile[];
    projectFile?: TextFilev2;
  }
> {
  subscription: Subscription | null;
  projectFilesSubscription: Subscription | null;
  constructor(props: any) {
    super(props);
    this.state = {
      logFiles: [],
    };
    this.subscription = null;
    this.projectFilesSubscription = null;
  }

  componentDidMount(): void {
    this.subscription = logFileLoading$
      .pipe(
        concatMap(async (file) => {
          const promise = new Promise((resolve) => {
            this.setState({ logFiles: [...this.state.logFiles, file] }, () => {
              resolve(file);
            });
          });

          return promise;
        })
      )
      .subscribe();

    this.projectFilesSubscription = projectFileLoading$
      .pipe(
        concatMap(async (file) => {
          const promise = new Promise((resolve) => {
            this.setState({ projectFile: file }, () => {
              resolve(file);
            });
          });

          return promise;
        })
      )
      .subscribe();
  }

  componentWillUnmount(): void {
    this.subscription?.unsubscribe();
    this.projectFilesSubscription?.unsubscribe();
  }

  updateLogFiles(file: LogFile) {
    const { logFiles } = this.state;
    const index = logFiles.findIndex((f) => f.name === file.name);
    if (index !== -1) {
      this.setState({
        logFiles: [
          ...logFiles.slice(0, index),
          file,
          ...logFiles.slice(index + 1),
        ],
      });
    } else {
      console.error("File not found cannot update", file);
    }
  }

  removeLogFile(file: LogFile) {
    const { logFiles } = this.state;
    const index = logFiles.findIndex((f) => f.name === file.name);
    if (index !== -1) {
      this.setState({
        logFiles: [...logFiles.slice(0, index), ...logFiles.slice(index + 1)],
      });
    } else {
      console.error("File not found cannot remove", file);
    }
  }

  render() {
    return (
      <LogFilesContext.Provider
        value={{
          logFiles: this.state.logFiles,
          projectFile: this.state.projectFile,
          updateLogFile: this.updateLogFiles.bind(this),
          removeLogFile: this.removeLogFile.bind(this),
        }}
      >
        <MemoComponent>{this.props.children}</MemoComponent>
      </LogFilesContext.Provider>
    );
  }
}

const FiveDaysInMiliSec = 5 * 24 * 60 * 60 * 1000;

function isPWAInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function ShowToastToPromptPWAInstall() {
  useUserActionPromtToast({
    id: "pwa-install-toast",
    coolOffTimeMS: FiveDaysInMiliSec,
    type: "warn",
    message: (
      <span>
        Install this app to your home screen for a better experience
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 visited:text-purple-600 hover:underline"
          href="https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/ux#installing-a-pwa"
        >
          Learn more
        </a>
      </span>
    ),
    condition: () => !isPWAInstalled(),
    options: {
      closeOnClick: false,
    },
  });

  useUserActionPromtToast({
    id: "pwa-file-system-toast",
    coolOffTimeMS: FiveDaysInMiliSec,
    type: "warn",
    message: (
      <span>
        Enable the file system access API for a native file experience
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 visited:text-purple-600 hover:underline"
          href="https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/handle-files#enable-the-file-handling-api"
        >
          Learn more
        </a>
      </span>
    ),
    condition: () => !isFileSystemAPIAvailable(),
    options: {
      closeOnClick: false,
    },
  });

  return null;
}

function useUserActionPromtToast({
  id,
  coolOffTimeMS,
  type,
  message,
  options,
  condition = () => true,
}: {
  id: string;
  coolOffTimeMS: number;
  type: "info" | "warn" | "error" | "success";
  message: any;
  condition?: () => boolean;
  options?: ToastOptions;
}) {
  const lasTimeToastWasShown = localStorage.getItem(id);
  const wasTriggered = useRef(false);

  useEffect(() => {
    const lasTimeToastWasShownDate =
      lasTimeToastWasShown == null ? null : new Date(lasTimeToastWasShown);

    const isTimeToShowPWAToast =
      lasTimeToastWasShownDate == null ||
      lasTimeToastWasShownDate.getTime() < new Date().getTime() - coolOffTimeMS;
    if (wasTriggered.current === false && isTimeToShowPWAToast && condition()) {
      toast[type](message, options);
      wasTriggered.current = true;
      localStorage.setItem(id, new Date().toString());
    }
  }, [
    coolOffTimeMS,
    id,
    lasTimeToastWasShown,
    message,
    options,
    type,
    condition,
  ]);

  return null;
}
