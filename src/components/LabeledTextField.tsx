import { PropsWithoutRef, ComponentPropsWithoutRef, useMemo } from "react";
import React, { forwardRef } from "react";
import { v4 as uuid } from "uuid";

export interface LabeledTextFieldProps {
  containerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  inputProps: PropsWithoutRef<JSX.IntrinsicElements["input"]>;
  label: string;
  labelProps?: ComponentPropsWithoutRef<"label">;
}

export const LabeledTextField = forwardRef<
  HTMLInputElement,
  LabeledTextFieldProps
>(({ containerProps, labelProps, inputProps, label }, ref) => {
  const id = useMemo(() => uuid(), []);
  return (
    <div {...containerProps} className="flex gap-1">
      <div className="">
        <label
          htmlFor={id}
          {...labelProps}
          className="text-sm font-semibold tracking-wide text-gray-700"
        >
          {label}:
        </label>
        <input
          id={id}
          {...inputProps}
          ref={ref}
          className="rounded border bg-gray-200 px-2 py-2 leading-tight text-gray-700 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
});
LabeledTextField.displayName = "LabeledTextField";
