import clsx from "clsx";
import type { PropsWithoutRef } from "react";

type ButtonProps = PropsWithoutRef<JSX.IntrinsicElements["button"]> & {
  look?: "primary" | "secondary" | "destructive" | "warning";
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  look = "primary",
  loading = false,
  ...props
}) => {
  const isDisabled = props.disabled || loading;
  return (
    <button
      {...(props as any)}
      //whileTap={{ scale: 0.9 }}
      //whileHover={{ scale: 1.01 }}
      disabled={isDisabled}
      className={clsx(
        "rounded border-4 font-semibold",
        {
          "border-teal-500 bg-teal-500 px-2 py-1 text-sm text-white hover:border-teal-700 hover:bg-teal-700":
            look === "primary",
          "border-red-500 bg-red-500 px-2 py-1 text-sm text-white hover:border-red-700 hover:bg-red-700":
            look === "destructive",
          "border-yellow-500 bg-yellow-500 px-2 py-1 text-sm text-white hover:border-yellow-700 hover:bg-yellow-700":
            look === "warning",
          "border-cyan-100 bg-cyan-100 px-2 py-1 text-sm  text-gray-700 hover:border-cyan-300 hover:bg-cyan-300":
            look === "secondary",
          "border-gray-500 bg-gray-500 px-2 py-1 text-sm text-white hover:border-gray-700 hover:bg-gray-700":
            props.disabled,
        },
        props.className
      )}
    >
      {loading ? "loading..." : props.children}
    </button>
  );
};
