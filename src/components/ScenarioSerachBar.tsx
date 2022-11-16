import React, { useCallback, useState } from "react";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { getFileColor } from "../domain/file-handling";
import useDebouncedCallback from "../domain/useDebouncedCallback";
import { LabeledTextField } from "./LabeledTextField";
import { withModal } from "./withModal";
import { v4 as uuid } from "uuid";
import {
  scenarioDiscoveryService,
  ScenarioStep,
} from "../domain/scenario-discovery-service";

// simple component that renders an input and a button to introduce commands
export function ScenarioSerachBar({ onComplete }: { onComplete: () => void }) {
  const [scenariosResult, setScenariosResult] = useState<ScenarioStep[]>(() =>
    scenarioDiscoveryService.getAllScenarios()
  );
  const { setFilter } = useProjectFileContext();

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
    <div className="flex flex-col dark:bg-[#011627] p-1">
      <LabeledTextField
        label="search scenarios"
        inputProps={{
          autoFocus: true,
          onChange: (e) => {
            const query = e.target.value;
            if (query === "*") {
              setScenariosResult(scenarioDiscoveryService.getAllScenarios());
            } else {
              searchScenariosDebounced(query);
            }
          },
        }}
      />
      <div className="border-t flex flex-col justify-start max-h-[30rem] overflow-auto">
        {scenariosResult.map((scenario) => (
          <button
            key={scenario.name}
            className="text-start p-1 border-b hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => onScenarioClick(scenario)}
          >
            <span>{scenario.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const ScenarioSerachBarModal = withModal(ScenarioSerachBar);
