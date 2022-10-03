import React from "react";
import { makeHTMLFileInputHandler } from "../domain/file-handling";
import {
  adaptFiltersToXML,
  extractFiltersFromXML,
} from "../domain/tat-xml-files";
import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { useLogFilesContext } from "./LogFilesContext";

export default function ManageTaTFilters() {
  const { setFilters, filters } = useLogFilesContext();
  const ref = React.useRef<HTMLInputElement>(null);

  const handle = makeHTMLFileInputHandler((xmlFile) => {
    const { filters, errors } = extractFiltersFromXML(xmlFile.content);
    if (errors.length > 0) {
      console.error(errors);
    } else {
      setFilters(filters);
      ref.current?.value && (ref.current.value = "");
    }
  });

  const onSaveFilters = () => {
    const xml = adaptFiltersToXML(filters);
    const blob = new Blob([xml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "filters.tat";
    link.click();
  };

  return (
    <div>
      <LabeledTextField
        ref={ref}
        label="Load tat Filters"
        inputProps={{
          type: "file",
          onChange: handle,
        }}
      />
      <Button onClick={onSaveFilters}>Download filters</Button>
    </div>
  );
}
