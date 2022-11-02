import {
  Bars2Icon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import FilterForm from "./FilterForm";
import { useLogLinesContext } from "../context/LogLinesContext";
import { PropsWithChildren, useCallback, useState } from "react";
import { IconButton } from "./IconButton";
import { Filter } from "../domain/types";
import { useProjectFileContext } from "../context/ProjectFileContext";
import { withModal } from "./withModal";
import {
  SortableContainer,
  SortableElement,
  SortEndHandler,
  SortableHandle,
} from "react-sortable-hoc";

const DragHandle = SortableHandle(() => (
  <IconButton
    className="cursor-grab"
    icon={<Bars2Icon className="h-4 w-4 cursor-grab " />}
  />
));

const Container = SortableContainer<PropsWithChildren>(({ children }: any) => {
  return (
    <div className="flex flex-col basis-2/3 overflow-auto">{children}</div>
  );
});

const SortableFilter = SortableElement<{ value: number; filter: Filter }>(
  ({ value, filter }: any) => {
    return <ActiveFilter order={value} filter={filter} key={filter.id} />;
  }
);

export function Filters() {
  const { apliedFilters: filters } = useLogLinesContext();
  const { updateFilterPriority } = useProjectFileContext();
  const onSortEnd = useCallback<SortEndHandler>(
    (params) => {
      updateFilterPriority(
        filters[params.oldIndex],
        params.newIndex - params.oldIndex
      );
    },
    [updateFilterPriority, filters]
  );

  return (
    <Container onSortEnd={onSortEnd} useDragHandle>
      {filters.map((filter, index) => (
        <SortableFilter
          filter={filter}
          key={filter.id}
          value={index}
          index={index}
        />
      ))}
    </Container>
  );
}

const ActiveFilter = ({ filter, order }: { filter: Filter; order: number }) => {
  const { removeFilter, disableFilter, enableFilter, setFilter } =
    useProjectFileContext();
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      className=" gap-2 flex items-center justify-between active:cursor-grabbing"
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
        <DragHandle />
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
          console.log("remove filter", filter.id);
          removeFilter(filter.id);
        }}
      ></IconButton>
      <FilterFormModal
        setShowModal={setShowModal}
        showModal={showModal}
        forwardProps={{ filter, isModal: true, copactMode: false }}
      />
    </div>
  );
};

export const FilterFormModal = withModal(FilterForm);
