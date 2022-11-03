import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { makeLogFile } from "../domain/log-lines-domain";
import { LogLinesContextProvider, useLogLinesContext } from "./LogLinesContext";
import { render } from "@testing-library/react";
import { Filter, LogLine } from "../domain/types";
import { ProjectType } from "./ProjectFileContext";

vi.mock("./FileContext.tsx", () => {
  const desktopClientLogs = `Wed Sep 28 2022 12:59:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:00:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log target
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 1
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 2
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 3 target
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 4
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log 5
Wed Sep 28 2022 13:00:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log
Wed Sep 28 2022 13:01:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- ...log`;

  const TMPTestLogs = `2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line target
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line test filter
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line target
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
    grouped line
    grouped line
    grouped line
  `;
  const TMPTestLogs2 = `2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line
2022-09-26T15:49:53.447Z Inf	CID[main] ...log line target
2022-09-26T15:49:53.443Z Inf	CID[main] ...log line target
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line 
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line 
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
    grouped line
    grouped line
    grouped line
`;
  return {
    useFilesContext: vi.fn().mockReturnValue({
      logFiles: [
        mockLogFile(TMPTestLogs),
        mockLogFile(desktopClientLogs),
        mockLogFile(TMPTestLogs2),
      ],
      updateLogFile: vi.fn(),
      removeLogFile: vi.fn(),
    }),
  };
});

vi.mock("./ProjectFileContext", () => ({
  useProjectFileContext: () => ({
    filters: mockFilters,
    project: mockProject,
  }),
}));

function TestContainer() {
  return (
    <LogLinesContextProvider>
      <TestChild />
    </LogLinesContextProvider>
  );
}
var linesInChild: LogLine[] = [];
var filteredLinesInChild: LogLine[] = [];
function TestChild() {
  const { lines, allLines } = useLogLinesContext();
  linesInChild = allLines;
  filteredLinesInChild = lines;
  return (
    <div>
      <span data-testid="linesLength">{lines.length}</span>
    </div>
  );
}

var mockFilters: Filter[] = [];
var mockProject: ProjectType = {
  name: "test",
  sortBy: "date",
  sortDirection: "asc",
  showOGDate: false,
  displayTimezone: 0,
  hideUnfiltered: false,
};
describe("LogLinesContext", () => {
  beforeEach(() => {
    linesInChild = [];
    filteredLinesInChild = [];
    mockFilters = [];
    mockProject = {
      name: "test",
      sortBy: "date",
      sortDirection: "asc",
      showOGDate: false,
      displayTimezone: 0,
      hideUnfiltered: false,
    };
  });
  test("should be able to render all lines", () => {
    render(<TestContainer />);
    expect(linesInChild.map((l) => l.hash)).toMatchInlineSnapshot(`
      [
        "defc725f-514f-53de-bd15-c541305965c3",
        "d051e93d-1f4d-5287-8478-aeb07dee8db5",
        "f21814f1-1648-5403-9be5-bc7b1ded3c7d",
        "ab2b5f85-80bc-5dd1-a778-ca4460ac3910",
        "446384e0-c5b7-53d4-ac86-ddd4db7abe11",
        "249402b1-8cf5-5061-a87c-b4dd5b38b4f4",
        "cd8e9c2b-b9a0-5737-95c4-5ce833ba22c2",
        "c17f1bcf-c72f-5b30-aeb4-fb0c03a11fd1",
        "8ef7f047-d010-5e6b-aa41-c04d781c50cc",
        "694a9ed7-2f87-5127-b173-6223178b07a4",
        "e7e1b5bf-136f-5eb4-810d-77a49f9c031b",
        "9a0ebaa2-ee7e-53f0-8389-24537335ad34",
        "72ec5caf-087a-5ed1-914b-5e7b47d85a89",
        "ea372a7e-a23d-5729-a7c3-b7239771c99a",
        "3e37287b-04ea-5fd5-bd58-0b6bf7803da5",
        "8dac873f-7495-58ab-95c3-2c86e9b59a62",
        "637b21ba-1d2b-5284-a3e6-16c9d8b8c04b",
        "ce2b8394-4bf7-59c4-8d53-b200bf435b2b",
        "30b79395-2609-5e2b-82f3-efff9ef944a7",
        "0f41cea1-ce4b-5d70-b514-50015f67866c",
        "57d3a4d0-a5a7-59ef-ac2f-3e841023d8d8",
      ]
    `);
  });
  test("should be able to provide filtered lines to child", () => {
    mockProject = { ...mockProject, hideUnfiltered: true };
    mockFilters = [
      {
        id: "test",
        filter: "target",
        color: "red",
        isDisabled: false,
        excluding: false,
        hitCount: 0,
        description: "",
        type: "text",
      },
    ];
    render(<TestContainer />);
    expect(filteredLinesInChild.map((l) => l.hash)).toMatchInlineSnapshot(`
      [
        "defc725f-514f-53de-bd15-c541305965c3",
        "f21814f1-1648-5403-9be5-bc7b1ded3c7d",
        "cd8e9c2b-b9a0-5737-95c4-5ce833ba22c2",
        "9a0ebaa2-ee7e-53f0-8389-24537335ad34",
        "ea372a7e-a23d-5729-a7c3-b7239771c99a",
        "637b21ba-1d2b-5284-a3e6-16c9d8b8c04b",
      ]
    `);
  });
});

function mockLogFile(content: string) {
  return makeLogFile({
    name: "test",
    content: content,
    fileHandle: null as any,
  });
}
