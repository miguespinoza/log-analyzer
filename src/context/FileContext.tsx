import React from "react";
import {
  fileLoading$,
  projectFileLoading$,
  TextFilev2,
} from "../domain/file-handling";
import { concatMap, Subscription } from "rxjs";
import { MemoComponent } from "../components/MemoComponent";
import { LogFile } from "../domain/types";

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
    this.subscription = fileLoading$
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
