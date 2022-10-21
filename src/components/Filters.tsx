import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import FilterForm from "./FilterForm";
import { useLogLinesContext } from "../context/LogLinesContext";
import { useState } from "react";
import { IconButton } from "./IconButton";
import { Filter } from "../domain/types";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { withModal } from "./withModal";

export function Filters() {
  const { apliedFilters: filters } = useLogLinesContext();
  return (
    <div className="filters flex flex-col overflow-auto w-full">
      {filters.map((filter) => (
        <ActiveFilter filter={filter} key={filter.id} />
      ))}
    </div>
  );
}

const ActiveFilter = ({ filter }: { filter: Filter }) => {
  const {
    removeFilter,
    disableFilter,
    enableFilter,
    updateFilterPriority,
    setFilter,
  } = useProjectFileContext();
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      className="gap-2 flex items-center justify-between"
      title={filter.description}
      style={{ backgroundColor: filter.color }}
    >
      <div className="itemx-center flex">
        <input
          type="checkbox"
          title="Enable/Disable filter"
          checked={!filter.isDisabled}
          onChange={(e) => {
            filter.isDisabled
              ? enableFilter(filter.filter)
              : disableFilter(filter.filter);
          }}
        />
        <button
          className="hover:bg-slate-400 p-1 rounded"
          title="decrease priority"
          onClick={() => updateFilterPriority(filter, -1)}
        >
          <ArrowUpIcon className="h-4 w-4" />
        </button>
        <button
          className="hover:bg-slate-400 p-1 rounded"
          title="increase priority"
          onClick={() => updateFilterPriority(filter, +1)}
        >
          <ArrowDownIcon className="h-4 w-4" />
        </button>
        <button
          className="hover:bg-slate-400 p-1 rounded"
          title="edit filter"
          onClick={() => setShowModal(true)}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <IconButton
          title="show/hide lines matching this filter"
          icon={
            filter.excluding ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )
          }
          onClick={() => {
            setFilter({ ...filter, excluding: !filter.excluding });
          }}
        ></IconButton>
      </div>
      <span className="text-left w-full min-w-[16rem]">{filter.filter}</span>
      <span className="text-left noWrap">hits: {filter.hitCount}</span>
      <span className="text-left noWrap">note: {filter.description}</span>
      <IconButton
        icon={<TrashIcon className="h-4 w-4" />}
        onClick={() => {
          removeFilter(filter.id);
        }}
      ></IconButton>
      <FilterFormModal
        setShowModal={setShowModal}
        showModal={showModal}
        forwardProps={{ filter, isModal: true }}
      />
    </div>
  );
};

export const FilterFormModal = withModal(FilterForm);
