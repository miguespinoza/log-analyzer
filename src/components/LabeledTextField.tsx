import { PropsWithoutRef, ComponentPropsWithoutRef, useMemo } from "react";
import React, { forwardRef } from "react";
import { v4 as uuid } from "uuid";
import clsx from "clsx";

export interface LabeledTextFieldProps {
  containerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  inputProps: PropsWithoutRef<JSX.IntrinsicElements["input"]>;
  label: string;
  labelProps?: ComponentPropsWithoutRef<"label">;
}

export interface LabeledSelectFieldProps {
  options: { value: string; renderer: string }[];
  containerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  label: string;
  labelProps?: ComponentPropsWithoutRef<"label">;
  selectProps: PropsWithoutRef<JSX.IntrinsicElements["select"]>;
}

export const LabeledSelectField = forwardRef<
  HTMLSelectElement,
  LabeledSelectFieldProps
>(({ options, containerProps, labelProps, selectProps, label }, ref) => {
  const id = useMemo(() => uuid(), []);
  return (
    <div
      {...containerProps}
      className={clsx("flex gap-1 items-center", containerProps?.className)}
    >
      <label
        htmlFor={id}
        {...labelProps}
        className="text-sm font-semibold tracking-wide text-gray-700 dark:text-white"
      >
        {label}:
      </label>
      <select
        id={id}
        {...selectProps}
        ref={ref}
        className={clsx(
          selectProps.disabled && "bg-gray-200 dark:bg-gray-400",
          "rounded border  dark:border-cyan-800 px-2 py-2 leading-tight ",
          "dark:bg-gray-700 bg-gray-200 text-gray-700 dark:text-white dark:focus:bg-gray-900 focus:bg-white focus:outline-none"
        )}
      >
        {options.map(({ value, renderer }) => (
          <option
            key={value}
            value={value}
            selected={selectProps.defaultValue === value}
          >
            {renderer}
          </option>
        ))}
      </select>
    </div>
  );
});

export const LabeledTextField = forwardRef<
  HTMLInputElement,
  LabeledTextFieldProps
>(({ containerProps, labelProps, inputProps, label }, ref) => {
  const id = useMemo(() => uuid(), []);
  return (
    <div
      {...containerProps}
      className={clsx("flex gap-1 items-center", containerProps?.className)}
    >
      <label
        htmlFor={id}
        {...labelProps}
        className="text-sm font-semibold tracking-wide text-gray-700 dark:text-white"
      >
        {label}:
      </label>
      <input
        id={id}
        {...inputProps}
        ref={ref}
        className={clsx(
          inputProps.disabled && "bg-gray-200 dark:bg-gray-400",
          "rounded border  dark:border-cyan-800 p-2 leading-tight ",
          "dark:bg-gray-700 bg-gray-200 text-gray-700 dark:text-white dark:focus:bg-gray-900 focus:bg-white focus:outline-none",
          inputProps.className
        )}
      />
    </div>
  );
});
LabeledTextField.displayName = "LabeledTextField";
