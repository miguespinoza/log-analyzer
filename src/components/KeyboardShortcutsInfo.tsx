import { useState } from "react";
import { Button } from "./Button";
import { withModal } from "./withModal";

function KeyboardShortcutsInfo() {
  return (
    <div className="dark:bg-[#011627] p-2 rounded">
      <h2 className="text-lg">Keyboard Shortcuts</h2>
      <p>
        These are the keyboard shortcuts that are available in the application.
      </p>
      <table>
        <thead className="border-b">
          <tr>
            <th className="pr-5">Shortcut</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ctrl+alt+q</td>
            <td>Open the scenario search bar</td>
          </tr>
          <tr>
            <td>ctrl+alt+h</td>
            <td>Toggle hiding unfiltered files</td>
          </tr>
          <tr>
            <td>ctrl+alt+f</td>
            <td>Filter by the selected text</td>
          </tr>
          <tr>
            <td>ctrl+alt+o</td>
            <td>Open File</td>
          </tr>
          <tr>
            <td>esc</td>
            <td>Close any Modal</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const KeyboardShortcutsInfoModal = withModal(KeyboardShortcutsInfo);

export const KeyboardShortcutsInfoModalButton = () => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  return (
    <div>
      <Button look="secondary" onClick={() => setShowKeyboardShortcuts(true)}>
        Keyboard Shortcuts
      </Button>
      <KeyboardShortcutsInfoModal
        showModal={showKeyboardShortcuts}
        setShowModal={setShowKeyboardShortcuts}
      />
    </div>
  );
};
