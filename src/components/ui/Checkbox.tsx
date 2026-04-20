import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={clsx(
          "h-4 w-4 rounded border-gray-300 text-blue-600",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
);
Checkbox.displayName = "Checkbox";
