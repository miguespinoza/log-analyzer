import clsx from "clsx";
import { useRef } from "react";
import { getFileColor } from "../domain/file-handling";
import { v4 as uuid } from "uuid";
import {
  getTimeHighlightPosition,
  TimeHighlight,
  TimelineService,
} from "../domain/timeline";
import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { Tooltip } from "./Tooltip";
import { withModal } from "./withModal";

export const TimeHighlightFormModal = withModal(TimeHighlightForm);

function TimeHighlightForm({
  addHighlight,
  date,
}: {
  addHighlight: (h: TimeHighlight) => void;
  date?: Date;
}) {
  return (
    <form
      className={clsx("flex flex-col gap-1 p-2", "dark:bg-[#011627]")}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const name = data.get("name") as string;
        const color = data.get("color") as string;

        if (name && color && date) {
          const newHighlight = new TimeHighlight(uuid(), date, name, color);
          addHighlight(newHighlight);
        }
      }}
    >
      <LabeledTextField
        label="Highlight name"
        inputProps={{ name: "name", required: true, autoFocus: true }}
      />
      <LabeledTextField
        inputProps={{
          type: "color",
          name: "color",
          defaultValue: getFileColor(),
          style: { padding: 0 },
        }}
        label="Color"
      />
      <Button type="submit">Save</Button>
    </form>
  );
}

export function TimeHighlightRenderer({
  highlight,
  containerEndDate,
  containerStartDate,
  containerHeight,
  onClick = () => {},
  onDoubleClick = () => {},
}: {
  highlight: TimeHighlight;
  containerStartDate: Date;
  containerEndDate: Date;
  containerHeight: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  const refElement = useRef<HTMLDivElement>(null);

  const position = getTimeHighlightPosition(
    highlight.date,
    containerStartDate,
    containerEndDate,
    containerHeight
  );

  return (
    <>
      <div
        ref={refElement}
        onClick={onClick}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDoubleClick();
        }}
        className="absolute w-full"
        data-testid="timeline-time-highlight"
        style={{
          top: position - 2,
          height: "4px",
          backgroundColor: highlight.color,
        }}
      ></div>
      <Tooltip triggerRef={refElement} placement="right">
        <span className="bg-slate-400 p-1 rounded">{highlight.label}</span>
      </Tooltip>
    </>
  );
}
