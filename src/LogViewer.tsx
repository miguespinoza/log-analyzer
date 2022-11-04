import clsx from "clsx";
import React, { useCallback, useLayoutEffect, useState } from "react";
import useResizeObserver from "use-resize-observer";
import { Filters } from "./components/Filters";
import { LinesRenderer } from "./components/LinesRenderer";
import LoadFiles from "./components/LoadFiles";
import { StatusBar } from "./components/StatusBar";
import { Toolbar } from "./components/Toolbar";
import useDebouncedCallback from "./domain/useDebouncedCallback";
import { useWindowSize } from "@react-hook/window-size/throttled";
import { ResizableBox } from "react-resizable";

type Size = { width: number; height: number };

type Layout = {
  logs: Size;
  bottombar: Size;
  sidebar: Size;
};

function makeLayout({
  windowSize,
  statusBarHeight,
  toolbarHeight,
  bottombarHeight = 200,
}: {
  windowSize: Size;
  statusBarHeight: number;
  toolbarHeight: number;
  bottombarHeight?: number;
}): Layout {
  const logsHeight =
    windowSize.height - statusBarHeight - toolbarHeight - bottombarHeight;

  return {
    logs: { width: windowSize.width, height: logsHeight },
    bottombar: { width: windowSize.width, height: bottombarHeight },
    sidebar: { width: 0, height: 0 },
  };
}

export function LogViewer() {
  const [screenWidth, screenHeight] = useWindowSize();
  const { ref: statusBarRef, height: statusBarHeight = 1 } =
    useResizeObserver<HTMLDivElement>({ box: "border-box" });
  const { ref: toolBarRef, height: toolbarHeight = 1 } =
    useResizeObserver<HTMLDivElement>({ box: "border-box" });

  const [layout, setLayout] = useState<Layout>(() =>
    makeLayout({
      windowSize: { width: screenWidth, height: screenHeight },
      statusBarHeight,
      toolbarHeight,
    })
  );

  useLayoutEffect(() => {
    setLayout(
      makeLayout({
        windowSize: { width: screenWidth, height: screenHeight },
        statusBarHeight,
        toolbarHeight,
        bottombarHeight: layout.bottombar.height,
      })
    );
  }, [
    statusBarHeight,
    toolbarHeight,
    screenHeight,
    screenWidth,
    layout.bottombar.height,
  ]);

  const bottomMinSize = statusBarHeight + toolbarHeight;
  const screenHeightBeforeResize = React.useRef(screenHeight);

  const onResize = useCallback(
    (e: any, { size }: any) => {
      setLayout((prev) => {
        let logsHeight = size.height;
        if (size.height > screenHeightBeforeResize.current - bottomMinSize) {
          logsHeight = screenHeightBeforeResize.current - bottomMinSize;
        }
        const bottomBarHeight =
          prev.bottombar.height + (prev.logs.height - logsHeight);
        return {
          ...prev,
          logs: { ...prev.logs, height: logsHeight },
          bottombar: { ...prev.bottombar, height: bottomBarHeight },
        };
      });
    },
    [setLayout, bottomMinSize]
  );

  const onResizeDebounced = useDebouncedCallback(onResize, 200);

  return (
    <div
      id="App"
      className={clsx(
        "min-h-screen bg-white dark:bg-[#011627]",
        "flex flex-col"
      )}
    >
      <ResizableBox
        height={layout.logs.height}
        width={layout.logs.width}
        onResizeStop={onResizeDebounced}
        onResizeStart={() => (screenHeightBeforeResize.current = screenHeight)}
        axis="y"
        resizeHandles={["s"]}
        className="flex"
      >
        <LinesRenderer width={layout.logs.width} height={layout.logs.height} />
      </ResizableBox>
      <Toolbar ref={toolBarRef} />
      <div
        style={{
          height: layout.bottombar.height,
          width: layout.bottombar.width,
        }}
        className="flex"
      >
        <Filters />
        <LoadFiles />
      </div>
      <StatusBar ref={statusBarRef} />
    </div>
  );
}
