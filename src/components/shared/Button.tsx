import { cx } from "cva";

interface ButtonProps extends JSX.HtmlButtonTag {}

export function Button({ children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      class={cx(
        "bg-purple-800/50 border-purple-500/40 hover:bg-purple-800/70 border p-3 font-bold rounded-lg",
        rest.class
      )}
    >
      {children}
    </button>
  );
}
