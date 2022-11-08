import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getFileColor } from "../domain/file-handling";
import {
  scenarioDiscoveryService,
  ScenarioStep,
} from "../domain/log-files-service";
import useDebouncedCallback from "../domain/useDebouncedCallback";
import { LabeledTextField } from "./LabeledTextField";
import { withModal } from "./withModal";
import { v4 as uuid } from "uuid";

// simple component that renders an input and a button to introduce commands
export function CommandBar({ onComplete }: { onComplete: () => void }) {
  const { lines } = useLogLinesContext();
  const [scenariosResult, setScenariosResult] = useState<ScenarioStep[]>([]);
  const { setFilter } = useProjectFileContext();

  useEffect(() => scenarioDiscoveryService.indexScenarios(lines), [lines]);

  const searchScenarios = useCallback((query: string) => {
    const result = scenarioDiscoveryService.searchScenarios(query);
    setScenariosResult(result);
  }, []);

  const searchScenariosDebounced = useDebouncedCallback(
    searchScenarios as any,
    200
  );

  const onScenarioClick = useCallback(
    (scenario: ScenarioStep) => {
      setFilter({
        filter: scenario.name,
        color: getFileColor(),
        hitCount: 0,
        id: uuid(),
      });
      onComplete();
    },
    [onComplete, setFilter]
  );

  return (
    <div className="flex flex-col ">
      <LabeledTextField
        label="search scenarios"
        inputProps={{
          autoFocus: true,
          onChange: (e) => {
            const query = e.target.value;
            searchScenariosDebounced(query);
          },
        }}
      />
      <div className="border-t flex flex-col justify-start max-h-[30rem] overflow-auto">
        {scenariosResult.map((scenario) => (
          <button onClick={() => onScenarioClick(scenario)}>
            <span>{scenario.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const CommandBarModal = withModal(CommandBar);
