import { useHotkeys } from "react-hotkeys-hook";
import { getFileColor } from "../domain/file-handling";
import { useLogLinesContext } from "../context/LogLinesContext";
import { v4 as uuid } from "uuid";
import { useProjectFileContext } from "../context/ProjectFileContext";

export function KeyboardShortCuts() {
  const { updateProject, project } = useProjectFileContext();
  const context = useLogLinesContext();

  useHotkeys(
    "ctrl+alt+h",
    () => {
      updateProject({ hideUnfiltered: !project.hideUnfiltered });
    },
    [updateProject, project.hideUnfiltered]
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
