import { cx } from "cva";

interface ButtonProps extends JSX.HtmlButtonTag {
  children: string;
  className?: string;
}

export function Button({ children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      class={cx(
        "bg-purple-800/50 border-purple-500/40 hover:bg-purple-800/40 border p-3 font-bold rounded-lg",
        rest.class
      )}
    >
      {children}
    </button>
  );
}
