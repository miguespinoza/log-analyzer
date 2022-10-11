import { v4 } from "uuid";
import { ProjectType } from "../context/ProjectFileContext";
import { Filter } from "./types";

/*

extract filters from xml file that looks like this
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<TextAnalysisTool.NET version="2020-12-17" showOnlyFilteredLines="False">
  <filters>
    <filter enabled="y" excluding="n" description="" type="matches_text" case_sensitive="n" regex="n" text="filter" />
  </filters>
</TextAnalysisTool.NET>
*/
export function extractFiltersFromXML(xml: string): {
  filters: Filter[];
  errors: string[];
} {
  const filters: Filter[] = [];
  const regex = /<filter.*?\/>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const raw = match[0];
    filters.push(adaptTATFilterToRLAFilter(extractTATFilterFromXML(raw)));
  }

  return { filters, errors: [] };
}

export function extractProjectFromXML(xml: string): ProjectType {
  const regex = /<project.*?\/>/g;
  const match = regex.exec(xml);
  if (match && match[0]) {
    return extractProjectFromXMLProject(match[0]);
  } else {
    throw new Error("Could not find project in xml");
  }
}

function extractProjectFromXMLProject(xml: string): ProjectType {
  return {
    name: getXMLPropery(xml, "name"),
    sortBy: getXMLPropery(xml, "sortBy") as "file" | "date",
    sortDirection: getXMLPropery(xml, "sortDirection") as "asc" | "desc",
    showOGDate: getXMLPropery(xml, "showOGDate") === "y",
    hideUnfiltered: getXMLPropery(xml, "hideUnfiltered") === "y",
  };
}

export function adaptProjectToXML(
  filters: Filter[],
  project?: ProjectType
): string {
  const tatFilters = filters.map((filter) => adaptRLAFilterToTATFilter(filter));
  const filterStrings = tatFilters.map((filter) => {
    return `<filter enabled="${filter.enabled}" excluding="${filter.excluding}" description="${filter.description}" backColor="${filter.backColor}" type="${filter.type}" case_sensitive="${filter.case_sensitive}" regex="${filter.regex}" text="${filter.text}" />`;
  });
  const projectString =
    project != null
      ? `<project name="${project?.name}" sortBy="${
          project?.sortBy
        }" sortDirection="${project?.sortDirection}" showOGDate="${
          project?.showOGDate ? "y" : "n"
        }" hideUnfiltered="${project?.hideUnfiltered ? "y" : "n"}" />`
      : "";
  const xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
  <TextAnalysisTool.NET version="2020-12-17" showOnlyFilteredLines="False">
    ${projectString}
    <filters>
      ${filterStrings.join("\r\n")}
    </filters>
  </TextAnalysisTool.NET>`;

  return xml;
}

type TATFilter = {
  enabled: string;
  excluding: string;
  description: string;
  type: string;
  case_sensitive: string;
  backColor: string;
  regex: string;
  text: string;
};

function adaptTATFilterToRLAFilter(tatFilter: TATFilter): Filter {
  return {
    id: v4(),
    isDisabled: !(tatFilter.enabled === "y"),
    excluding: tatFilter.excluding === "y",
    description: tatFilter.description,
    color: tatFilter.backColor !== "" ? "#" + tatFilter.backColor : softOrange,
    hitCount: 0,
    type: tatFilter.type,
    filter: tatFilter.text,
  };
}

function adaptRLAFilterToTATFilter(filter: Filter): TATFilter {
  return {
    enabled: filter.isDisabled ? "n" : "y",
    excluding: filter.excluding ? "y" : "n",
    description: filter.description ?? "",
    backColor: filter.color.substring(1),
    type: filter.type ?? "matches_text",
    case_sensitive: "n",
    regex: "n",
    text: filter.filter,
  };
}

function extractTATFilterFromXML(xml: string): TATFilter {
  return {
    enabled: getXMLPropery(xml, "enabled"),
    excluding: getXMLPropery(xml, "excluding"),
    description: getXMLPropery(xml, "description"),
    backColor: getXMLPropery(xml, "backColor"),
    type: getXMLPropery(xml, "type"),
    case_sensitive: getXMLPropery(xml, "case_sensitive"),
    regex: getXMLPropery(xml, "regex"),
    text: getXMLPropery(xml, "text"),
  };
}

const softOrange = "#f08080";

function getXMLPropery(xml: string, property: string) {
  const regexString = `${property}="(.*?)"`;
  const regex = new RegExp(regexString);
  const match = regex.exec(xml);
  if (match) {
    return match[1];
  }
  return "";
}
