import { forwardRef } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {label}
            {props.required && <span style={{ color: "var(--color-danger)" }}> *</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div
              className="absolute left-3 flex items-center pointer-events-none"
              style={{ color: "var(--color-text-subtle)" }}
            >
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full text-sm transition-colors ${className}`}
            style={{
              backgroundColor: props.disabled ? "var(--color-bg)" : "var(--color-surface)",
              border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
              borderRadius: "var(--radius)",
              padding: `6px 12px`,
              paddingLeft: prefix ? "36px" : "12px",
              color: "var(--color-text)",
              height: "36px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-brand)";
              e.target.style.boxShadow = `0 0 0 2px ${error ? "rgba(220,38,38,0.15)" : "rgba(196,154,42,0.15)"}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
            {...props}
          />
        </div>
        {error && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
