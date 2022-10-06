import React from "react";
import { fileLoading$ } from "../domain/file-handling";
import { LogFile } from "./LogFilesContext";
import { concatMap, Subscription } from "rxjs";
import { MemoComponent } from "../components/MemoComponent";

export type LogFilesContextType = {
  logFiles: LogFile[];
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
  }
> {
  subscription: Subscription | null;
  constructor(props: any) {
    super(props);
    this.state = {
      logFiles: [],
    };
    this.subscription = null;
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
  }

  componentWillUnmount(): void {
    this.subscription?.unsubscribe();
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
          updateLogFile: this.updateLogFiles.bind(this),
          removeLogFile: this.removeLogFile.bind(this),
        }}
      >
        <MemoComponent>{this.props.children}</MemoComponent>
      </LogFilesContext.Provider>
    );
  }
}
