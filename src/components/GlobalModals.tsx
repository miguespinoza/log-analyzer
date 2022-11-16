import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { ScenarioSerachBarModal } from "./ScenarioSerachBar";
import { TimeHighlightFormModal } from "./TimeHighlight";

export function GlobalModals() {
  const [commandBarIsOpen, setCommandBarIsOpen] = useState(false);
  const { addTimeHighlight, addingTimeHighlightAt, setAddingTimeHighlightAt } =
    useProjectFileContext();
  useHotkeys("ctrl+alt+q", () => {
    setCommandBarIsOpen(true);
  });
  return (
    <>
      <TimeHighlightFormModal
        showModal={addingTimeHighlightAt != null}
        setShowModal={() => setAddingTimeHighlightAt(null)}
        forwardProps={{
          addHighlight: (h) => {
            addTimeHighlight(h);
            setAddingTimeHighlightAt(null);
          },
          date: addingTimeHighlightAt as Date,
        }}
      />
      <ScenarioSerachBarModal
        showModal={commandBarIsOpen}
        setShowModal={setCommandBarIsOpen}
        forwardProps={{ onComplete: () => setCommandBarIsOpen(false) }}
      />
    </>
  );
}
