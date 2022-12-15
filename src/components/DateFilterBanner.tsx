import { useProjectFileContext } from "../context/ProjectFileContext";
import { getDateStringAtTz } from "../domain/timezone";
import { Button } from "./Button";

export function DateFilterBanner() {
  const { project, startDate, endDate, setStartDate, setEndDate } =
    useProjectFileContext();
  return (
    <div className="flex gap-2 items-center bg-yellow-400 w-full justify-around">
      <span className="font-bold">Date Filter in use</span>
      <span>
        Start Date:{" "}
        {startDate
          ? getDateStringAtTz(startDate, project.displayTimezone)
          : "None"}
        <Button look="secondary" onClick={() => setStartDate(undefined)}>
          Reset
        </Button>
      </span>
      <span>
        End Date:{" "}
        {endDate ? getDateStringAtTz(endDate, project.displayTimezone) : "None"}
        <Button look="secondary" onClick={() => setEndDate(undefined)}>
          Reset
        </Button>
      </span>

      <Button
        look="primary"
        title="click to remove date filter "
        onClick={() => {
          setEndDate(undefined);
          setStartDate(undefined);
        }}
      >
        Click to remove (ctrl + alt + d)
      </Button>
    </div>
  );
}
