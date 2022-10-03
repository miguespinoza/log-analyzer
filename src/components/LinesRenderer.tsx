import { LogLine } from "../domain/log-lines-domain";
import { useLogFilesContext } from "./LogFilesContext";
import { Virtuoso } from "react-virtuoso";
import useResizeObserver from "use-resize-observer";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function LinesRenderer() {
  const { lines } = useLogFilesContext();
  const listRef = useRef<any>();
  const linesLengthRef = useRef<number>();

  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const [focusedLine, setFocusedLine] = useState<LogLine | null>(null);

  const focusedLineIndex = useMemo(
    () => lines.findIndex((l) => l.hash === focusedLine?.hash),
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
          listRef.current.scrollToIndex({ index: lineIndex, align: "center" });
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
      />
    );
  };

  return (
    <div data-tid="measurer" className="w-full logs border" ref={ref}>
      <Virtuoso
        ref={listRef as any}
        style={{ height: `${height}px`, width: `${width}px` }}
        totalCount={lines.length}
        itemContent={LineRenderer}
      ></Virtuoso>
    </div>
  );
}

//calm blue
const calmBlue = "#1e90ff";

function LogLineRenderer({
  line,
  onClick,
  focusedLine,
}: {
  line: LogLine;
  focusedLine: LogLine | null;
  onClick?: (line: LogLine) => void;
}) {
  const { getLineColorByFilter } = useLogFilesContext();

  const color = getLineColorByFilter(line) ?? "white";
  const date =
    line.date == null || isNaN(line.date?.getTime() ?? NaN)
      ? null
      : line.date.toISOString();
  return (
    <div
      className="flex gap-1"
      style={{
        backgroundColor: focusedLine?.hash === line.hash ? calmBlue : color,
      }}
      onClick={() => onClick && onClick(line)}
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
      {date != null && <span className="noWrap bg-stone-300">{date}</span>}
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
