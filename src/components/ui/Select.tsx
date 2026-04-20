import { type SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, id, ...props }, ref) => (
    <div className="inline-flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-gray-600">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={clsx(
          "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
);
Select.displayName = "Select";
