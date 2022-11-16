import { LogLine } from "./types";
import Fuse from "fuse.js";

export type ScenarioStep = {
  name: string;
  step: string;
  stepNumber: number;
  lineHash: string;
  timestamp: number;
};
interface ScenarioDiscoveryService {
  indexScenarios(lines: LogLine[]): void;
  searchScenarios(search: string): ScenarioStep[];
  getAllScenarios(): ScenarioStep[];
}

class ScenarioDiscoveryServiceImplementation
  implements ScenarioDiscoveryService
{
  private fuse: Fuse<ScenarioStep> | null = null;
  public scenariosSet: Set<string> = new Set();
  private scenarios: ScenarioStep[] = [];

  private resetIndex() {
    this.scenariosSet = new Set();
    this.fuse = null;
    this.scenarios = [];
  }

  public indexScenarios(lines: LogLine[]): void {
    this.resetIndex();
    for (const line of lines) {
      const scenario = this.parseScenarioLine(line);
      if (scenario && !this.scenariosSet.has(scenario.name)) {
        this.scenariosSet.add(scenario.name);
        this.scenarios.push(scenario);
      }
    }
    console.time("indexing scenarios");
    this.fuse = new Fuse(this.scenarios, { keys: ["name"] });
    console.timeEnd("indexing scenarios");
  }

  public getAllScenarios(): ScenarioStep[] {
    return this.scenarios;
  }

  public searchScenarios(search: string) {
    if (this.fuse == null) {
      console.error("scenarios not indexed");
      return [];
    }

    const results = this.fuse.search(search);
    return results.map((r) => r.item);
  }

  private parseScenarioLine(line: LogLine): ScenarioStep | undefined {
    // match [Scenario]people_get_all_short_profile [step](0)error (56ms)
    // [Scenario]video_stream_rendering start
    const match = line.text.match(/\[Scenario\](\S*)/);
    if (match) {
      const step = this.getScenarioStep(line.text);
      return {
        name: match[1],
        step: step?.name ?? "",
        stepNumber: step?.stepNumber ?? 0,
        lineHash: line.hash,
        timestamp: parseInt(match[4]),
      };
    }
  }

  private getScenarioStep(line: string) {
    const match = line.match(/\[step\]\((\d*)\)(.*)/);
    if (match) {
      return {
        stepNumber: parseInt(match[1]),
        name: match[2],
      };
    }
  }
}

export const scenarioDiscoveryService =
  new ScenarioDiscoveryServiceImplementation();
