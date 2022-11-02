import { expect, test } from "vitest";
import { Filter } from "./types";
import { adaptProjectToXML, extractFiltersFromXML } from "./tat-xml-files";

test("extractFiltersFromXML", () => {
  const xml = `
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<TextAnalysisTool.NET version="2020-12-17" showOnlyFilteredLines="False">
  <filters>
    <filter enabled="y" excluding="n" description="" type="matches_text" case_sensitive="n" regex="n" text="filter1" />
    <filter enabled="y" excluding="n" description="" backColor="f08080" type="matches_text" case_sensitive="n" regex="n" text="filter2" />
    <filter enabled="y" excluding="n" description="" backColor="ff0000" type="matches_text" case_sensitive="n" regex="n" text="filter 3" />
    <filter enabled="y" excluding="n" description="" type="matches_text" case_sensitive="n" regex="n" text="filter 4" />
  </filters>
</TextAnalysisTool.NET>
`;
  const { filters } = extractFiltersFromXML(xml);
  expect(
    filters.map((f, i) => {
      f.id = i.toString();
      return f;
    })
  ).toMatchInlineSnapshot(`
    [
      {
        "color": "#f08080",
        "description": "",
        "excluding": false,
        "filter": "filter1",
        "hitCount": 0,
        "id": "0",
        "isDisabled": false,
        "type": "matches_text",
      },
      {
        "color": "#f08080",
        "description": "",
        "excluding": false,
        "filter": "filter2",
        "hitCount": 0,
        "id": "1",
        "isDisabled": false,
        "type": "matches_text",
      },
      {
        "color": "#ff0000",
        "description": "",
        "excluding": false,
        "filter": "filter 3",
        "hitCount": 0,
        "id": "2",
        "isDisabled": false,
        "type": "matches_text",
      },
      {
        "color": "#f08080",
        "description": "",
        "excluding": false,
        "filter": "filter 4",
        "hitCount": 0,
        "id": "3",
        "isDisabled": false,
        "type": "matches_text",
      },
    ]
  `);
});

test("adaptFiltersToXML", () => {
  const filters: Filter[] = [
    {
      color: "#f08080",
      description: "`12",
      excluding: true,
      filter: "filter string",
      id: "0",
      isDisabled: false,
      hitCount: 1,
      type: "matches_text",
    },
    {
      color: "#f08080",
      description: "asdas ",
      excluding: false,
      filter: "filter string",
      id: "0",
      isDisabled: true,
      hitCount: 1,
      type: "matches_text",
    },
    {
      color: "#f08080",
      description: "",
      excluding: false,
      filter: "filter string",
      id: "0",
      isDisabled: false,
      hitCount: 1,

      type: "matches_text",
    },
  ];
  const xml = adaptProjectToXML(filters);
  expect(xml).toMatchInlineSnapshot(`
    "<?xml version=\\"1.0\\" encoding=\\"utf-8\\" standalone=\\"yes\\"?>
      <TextAnalysisTool.NET version=\\"2020-12-17\\" showOnlyFilteredLines=\\"False\\">
        
        <filters>
          <filter enabled=\\"y\\" excluding=\\"y\\" description=\\"\`12\\" backColor=\\"f08080\\" type=\\"matches_text\\" case_sensitive=\\"n\\" regex=\\"n\\" text=\\"filter string\\" />
    <filter enabled=\\"n\\" excluding=\\"n\\" description=\\"asdas \\" backColor=\\"f08080\\" type=\\"matches_text\\" case_sensitive=\\"n\\" regex=\\"n\\" text=\\"filter string\\" />
    <filter enabled=\\"y\\" excluding=\\"n\\" description=\\"\\" backColor=\\"f08080\\" type=\\"matches_text\\" case_sensitive=\\"n\\" regex=\\"n\\" text=\\"filter string\\" />
        </filters>
      </TextAnalysisTool.NET>"
  `);
});
