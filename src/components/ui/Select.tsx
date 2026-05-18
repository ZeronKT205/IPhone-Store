import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption { value: string; label: string }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {label}
            {props.required && <span style={{ color: "var(--color-danger)" }}> *</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full text-sm appearance-none pr-8 ${className}`}
            style={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
              borderRadius: "var(--radius)",
              padding: "6px 12px",
              color: "var(--color-text)",
              height: "36px",
              outline: "none",
              cursor: "pointer",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-brand)";
              e.target.style.boxShadow = "0 0 0 2px rgba(196,154,42,0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-subtle)" }}
          />
        </div>
        {error && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
