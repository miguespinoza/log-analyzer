import { describe, expect, test, vi } from "vitest";
import { makeLogFile } from "./log-file";
import { scenarioDiscoveryService } from "./scenario-discovery-service";

describe("ScenarioDiscovery", () => {
  const logs = `2022-09-26T15:50:18.624Z Inf	CDL: ...log
2022-09-26T15:50:18.632Z Inf	CDL: ...log
2022-09-26T15:50:18.634Z Inf	CDL: ...log
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]test-scenario [step](1)error (56ms)
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]test-scenario [step](0)error (56ms)
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]test-scenario start
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]do-stuff [step](1)stuff (56ms)
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]do-stuff [step](0)doing (56ms)
2022-09-26T15:50:18.636Z Inf	CDL: [Scenario]do-stuff start
2022-09-26T15:50:18.636Z Inf	CDL: ...log
2022-09-26T15:50:18.637Z Inf	CDL: ...log
2022-09-26T15:50:18.653Z Inf	...log
2022-09-26T15:51:00.311Z Inf	...log
  `;

  test("test scenario discovery", () => {
    const file1 = makeLogFile({
      fileHandle: {} as any,
      content: logs,
      name: "one",
    });

    scenarioDiscoveryService.indexScenarios(file1.getLogLines());

    expect(scenarioDiscoveryService.getAllScenarios()).toMatchInlineSnapshot(`
      [
        {
          "lineHash": "f6d2bdde-00b8-511d-9f8d-0b7fe7f5b909",
          "name": "test-scenario",
          "step": "error (56ms)",
          "stepNumber": 1,
          "timestamp": NaN,
        },
        {
          "lineHash": "14708403-f138-55e5-abc8-71db9d65659c",
          "name": "do-stuff",
          "step": "stuff (56ms)",
          "stepNumber": 1,
          "timestamp": NaN,
        },
      ]
    `);

    expect(scenarioDiscoveryService.searchScenarios("test-scenario"))
      .toMatchInlineSnapshot(`
        [
          {
            "lineHash": "f6d2bdde-00b8-511d-9f8d-0b7fe7f5b909",
            "name": "test-scenario",
            "step": "error (56ms)",
            "stepNumber": 1,
            "timestamp": NaN,
          },
        ]
      `);
  });
});
