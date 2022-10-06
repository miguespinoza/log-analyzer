import React from "react";
import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { useLogFilesContext } from "../context/LogFilesContext";
import { v4 as uuid } from "uuid";
import { Filter } from "../domain/types";

const softgreen = "#b3e5fc";

export default function FilterForm({
  filter: edditingFilter,
  hint,
  onSaved,
  copactMode = true,
}: {
  filter?: Filter;
  hint?: string;
  onSaved?: () => void;
  copactMode?: boolean;
}) {
  const { setFilter: addFilter, updateFilter } = useLogFilesContext();
  return (
    <div>
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
              defaultValue: edditingFilter?.filter ?? hint,
            }}
          />
          <LabeledTextField
            inputProps={{
              type: "color",
              name: "color",
              defaultValue: edditingFilter?.color ?? softgreen,
              style: { padding: 0 },
            }}
            label="Color"
          />
          {copactMode && (
            <Button
              type="submit"
              title="for quick filter, select text and ctrl+alt+f"
              hidden={copactMode}
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
