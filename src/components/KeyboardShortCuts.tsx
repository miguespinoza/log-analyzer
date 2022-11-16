import { useHotkeys } from "react-hotkeys-hook";
import { getFileColor, onLogFilePickerClick } from "../domain/file-handling";
import { v4 as uuid } from "uuid";
import { useProjectFileContext } from "../context/ProjectFileContext";

export function KeyboardShortCuts() {
  const { updateProject, project } = useProjectFileContext();
  const { setFilter } = useProjectFileContext();
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
          setFilter({
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
    [setFilter]
  );

  useHotkeys("ctrl+alt+o", () => {
    try {
      onLogFilePickerClick();
    } catch (e) {
      console.error(e);
    }
  });

  return null;
}
