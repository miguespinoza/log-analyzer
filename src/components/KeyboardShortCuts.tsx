import { useHotkeys } from "react-hotkeys-hook";
import { getFileColor } from "../domain/file-handling";
import { v4 as uuid } from "uuid";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { useState } from "react";
import { ScenarioSerachBarModal } from "./ScenarioSerachBar";

export function KeyboardShortCuts() {
  const { updateProject, project } = useProjectFileContext();
  const { setFilter } = useProjectFileContext();
  const [commandBarIsOpen, setCommandBarIsOpen] = useState(false);
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

  useHotkeys("ctrl+alt+q", () => {
    setCommandBarIsOpen(true);
  });

  return (
    <>
      <ScenarioSerachBarModal
        showModal={commandBarIsOpen}
        setShowModal={setCommandBarIsOpen}
        forwardProps={{ onComplete: () => setCommandBarIsOpen(false) }}
      />
    </>
  );
}
