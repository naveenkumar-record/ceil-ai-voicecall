import { cn } from "../../lib/cn.js";

export function Radio({ className, ...props }) {
  return (
    <input
      type="radio"
      className={cn(
        "h-4 w-4 border-slate-300 bg-white accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
