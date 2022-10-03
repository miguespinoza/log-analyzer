import { useHotkeys } from "react-hotkeys-hook";
import { getFileColor } from "../domain/file-handling";
import { useLogFilesContext } from "./LogFilesContext";
import { v4 as uuid } from "uuid";

export function KeyboardShortCuts() {
  const context = useLogFilesContext();

  useHotkeys(
    "ctrl+alt+h",
    () => {
      context.setHideUnfiltered(!context.hideUnfiltered);
    },
    [context.hideUnfiltered, context.setHideUnfiltered]
  );

  useHotkeys(
    "ctrl+alt+f",
    () => {
      try {
        const selection = window.getSelection()?.toString();
        if (selection != null && selection.length > 0) {
          context.setFilter({
            filter: selection,
            color: getFileColor(),
            hitCount: 0,
            id: uuid(),
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [context.setFilter]
  );
  return null;
}
