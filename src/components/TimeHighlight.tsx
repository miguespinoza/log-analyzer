import clsx from "clsx";
import { useRef } from "react";
import { getFileColor } from "../domain/file-handling";
import { TimeHighlight, TimelineService } from "../domain/timeline";
import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { Tooltip } from "./Tooltip";
import { withModal } from "./withModal";

export const TimeHighlightFormModal = withModal(TimeHighlightForm);

function TimeHighlightForm({
  addHighlight,
  relativePixel,
  timelineService,
}: {
  addHighlight: (h: TimeHighlight) => void;
  relativePixel: number;
  timelineService: TimelineService;
}) {
  return (
    <form
      className={clsx("flex flex-col gap-1 p-2", "dark:bg-[#011627]")}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const name = data.get("name") as string;
        const color = data.get("color") as string;

        if (name && color) {
          const newHighlight = timelineService.makeTimeHighlight(
            relativePixel,
            name,
            color
          );
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
  onClick = () => {},
  onDoubleClick = () => {},
}: {
  highlight: TimeHighlight;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  const refElement = useRef<HTMLDivElement>(null);

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
          top: highlight.relativePx - 2,
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
