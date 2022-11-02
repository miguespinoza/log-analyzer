import React from "react";
import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { v4 as uuid } from "uuid";
import { Filter } from "../domain/types";
import { useProjectFileContext } from "../context/ProjectFileContext";
import clsx from "clsx";
import { getFileColor } from "../domain/file-handling";


export default function FilterForm({
  filter: edditingFilter,
  hint,
  onSaved,
  copactMode = true,
  isModal = false,
}: {
  filter?: Filter;
  hint?: string;
  onSaved?: () => void;
  copactMode?: boolean;
  isModal?: boolean;
}) {
  const { setFilter: addFilter, updateFilter } = useProjectFileContext();
  return (
    <div className={clsx(isModal && "dark:bg-[#011627] p-2 rounded ")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          const filter = data.get("filter") as string | undefined;
          const color = data.get("color") as string | undefined;
          const description = data.get("description") as string | undefined;

          if (filter == null) {
            console.log("filter cannot be empty");
            return;
          }
          if (color == null) {
            console.log("color cannot be empty");
            return;
          }
          if (edditingFilter == null) {
            addFilter({ filter, color, id: uuid(), description, hitCount: 0 });
            form.reset();
          } else {
            updateFilter({
              filter,
              color,
              id: edditingFilter.id,
              description,
              hitCount: 0,
            });
            form.reset();
          }
          onSaved?.();
        }}
        className="flex gap-2 flex-col"
      >
        <div className="flex gap-1">
          <LabeledTextField
            label="Filter"
            inputProps={{
              name: "filter",
              autoFocus: isModal,
              defaultValue: edditingFilter?.filter ?? hint,
            }}
          />
          <LabeledTextField
            inputProps={{
              type: "color",
              name: "color",
              defaultValue: edditingFilter?.color ?? getFileColor(),
              style: { padding: 0 },
            }}
            label="Color"
          />
          {copactMode && (
            <Button
              type="submit"
              title="for quick filter, select text and ctrl+alt+f"
            >
              save
            </Button>
          )}
        </div>
        {!copactMode && (
          <div>
            <LabeledTextField
              inputProps={{
                type: "text",
                name: "description",
                defaultValue: edditingFilter?.description ?? "",
                style: { padding: 0 },
              }}
              label="Description"
            />
            <Button
              type="submit"
              title="for quick filter, select text and ctrl+alt+f"
              hidden={copactMode}
            >
              save
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
