import { useLogLinesContext } from "../context/LogLinesContext";
import { Virtuoso } from "react-virtuoso";
import useResizeObserver from "use-resize-observer";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FilterFormModal } from "./Filters";
import { LogLine } from "../domain/types";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getDateStringAtTz } from "../domain/timezone";

export function LinesRenderer() {
  const { lines } = useLogLinesContext();
  const listRef = useRef<any>();
  const linesLengthRef = useRef<number>();
  const [isNewFilterModalOpen, setIsNewFilterModalOpen] = useState(false);
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const [focusedLine, setFocusedLine] = useState<LogLine | null>(null);
  const { project } = useProjectFileContext();
  const focusedLineIndex = useMemo(
    () => lines.findIndex((l) => l.id === focusedLine?.id),
    [focusedLine, lines]
  );

  useHotkeys(
    "w",
    () => {
      if (focusedLineIndex > -1 && focusedLineIndex > 0) {
        setFocusedLine(lines[focusedLineIndex - 1]);
      }
    },
    [focusedLineIndex, lines, setFocusedLine]
  );

  useHotkeys(
    "s",
    () => {
      if (focusedLineIndex > -1 && focusedLineIndex < lines.length - 1) {
        setFocusedLine(lines[focusedLineIndex + 1]);
      }
    },
    [focusedLineIndex, lines, setFocusedLine]
  );

  useLayoutEffect(() => {
    if (linesLengthRef.current !== lines.length) {
      if (focusedLine && listRef.current) {
        const lineIndex = focusedLineIndex;
        if (lineIndex !== -1) {
          setTimeout(() => {
            listRef.current.scrollToIndex({
              index: lineIndex,
              align: "center",
            });
          }, 0);
        } else {
          console.warn("Focused line not found");
        }
      }
    }
  }, [focusedLine, lines, linesLengthRef, focusedLineIndex]);

  useLayoutEffect(() => {
    linesLengthRef.current = lines.length;
  }, [lines]);

  const LineRenderer = (index: number) => {
    const line = lines[index];
    return (
      <LogLineRenderer
        focusedLine={focusedLine}
        line={line}
        onClick={setFocusedLine}
        displayTimezoneOffset={project.displayTimezone}
        onDoubleClick={() => {
          setIsNewFilterModalOpen(true);
        }}
      />
    );
  };

  return (
    <div data-tid="measurer" className="w-full logs" ref={ref}>
      <Virtuoso
        ref={listRef as any}
        style={{ height: `${height}px`, width: `${width}px` }}
        totalCount={lines.length}
        itemContent={LineRenderer}
      ></Virtuoso>
      <FilterFormModal
        forwardProps={{
          hint: focusedLine?.text,
        }}
        showModal={isNewFilterModalOpen}
        setShowModal={setIsNewFilterModalOpen}
      ></FilterFormModal>
    </div>
  );
}

//calm blue
const calmBlue = "#1e90ff";

function LogLineRenderer({
  line,
  onClick,
  focusedLine,
  onDoubleClick,
  displayTimezoneOffset,
}: {
  line: LogLine;
  focusedLine: LogLine | null;
  onClick?: (line: LogLine) => void;
  onDoubleClick?: (line: LogLine) => void;
  displayTimezoneOffset: number;
}) {
  const color = line.matchedFilters?.color ?? undefined;
  const date =
    line.date == null || isNaN(line.date?.getTime() ?? NaN)
      ? null
      : getDateStringAtTz(line.date, displayTimezoneOffset);
  return (
    <div
      className="flex gap-1"
      style={{
        backgroundColor: focusedLine?.hash === line.hash ? calmBlue : color,
      }}
      onClick={() => onClick && onClick(line)}
      onDoubleClick={() => onDoubleClick && onDoubleClick(line)}
    >
      <span
        style={{
          backgroundColor: line.fileColor,
        }}
        title={line.fileName}
        className="noWrap bg-stone-300 min-w-[3rem] text-sm text-center"
      >
        {line.count}
      </span>
      {date != null && (
        <span className="noWrap bg-stone-300 dark:bg-cyan-900 pl-1 pr-1">
          {date}
        </span>
      )}
      <span
        style={{
          backgroundColor: focusedLine?.hash === line.hash ? calmBlue : color,
        }}
        className="noWrap align-text-top "
      >
        {line.text}
      </span>
    </div>
  );
}
