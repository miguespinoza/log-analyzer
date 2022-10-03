import clsx from "clsx";
import { PropsWithoutRef } from "react";

type IconButtonProps = PropsWithoutRef<JSX.IntrinsicElements["button"]> & {
  loading?: boolean;
  icon: JSX.Element;
};

export const IconButton = ({ icon, loading, ...props }: IconButtonProps) => {
  const isDisabled = props.disabled || loading;
  return (
    <button
      {...(props as any)}
      className={clsx("hover:bg-slate-400 p-1 rounded", props.className)}
      disabled={isDisabled}
    >
      {icon}
    </button>
  );
};
