import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: {
    backgroundColor: "var(--color-brand)",
    color: "#fff",
    border: "none",
    hover: "var(--color-brand-dark)",
    hoverShadow: "0 2px 8px rgba(196,154,42,0.30)",
    activeShadow: "inset 0 1px 4px rgba(0,0,0,0.18)",
  },
  secondary: {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    hover: "var(--color-bg)",
    hoverShadow: "0 1px 5px rgba(0,0,0,0.07)",
    activeShadow: "inset 0 1px 3px rgba(0,0,0,0.10)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-muted)",
    border: "none",
    hover: "var(--color-bg)",
    hoverShadow: "none",
    activeShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
  },
  danger: {
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger)",
    border: "1px solid #FCA5A5",
    hover: "#FEE2E2",
    hoverShadow: "0 1px 5px rgba(239,68,68,0.15)",
    activeShadow: "inset 0 1px 3px rgba(0,0,0,0.12)",
  },
};

const sizes = {
  sm:  { padding: "4px 10px", fontSize: "12px", height: "28px" },
  md:  { padding: "6px 14px", fontSize: "13px", height: "34px" },
  lg:  { padding: "8px 18px", fontSize: "14px", height: "40px" },
};

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className = "",
  disabled,
  style: externalStyle,
  onMouseEnter: externalMouseEnter,
  onMouseLeave: externalMouseLeave,
  onMouseDown: externalMouseDown,
  onMouseUp: externalMouseUp,
  ...props
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];
  const isInert = disabled || loading;

  return (
    <button
      className={`inline-flex items-center gap-2 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: v.backgroundColor,
        color: v.color,
        border: v.border,
        padding: s.padding,
        fontSize: s.fontSize,
        height: s.height,
        borderRadius: "var(--radius)",
        transition: "background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease",
        willChange: "transform",
        ...externalStyle,
      }}
      disabled={isInert}
      onMouseEnter={(e) => {
        if (!isInert) {
          e.currentTarget.style.backgroundColor = v.hover;
          if (v.hoverShadow !== "none") e.currentTarget.style.boxShadow = v.hoverShadow;
        }
        externalMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isInert) {
          e.currentTarget.style.backgroundColor = (externalStyle as any)?.backgroundColor ?? v.backgroundColor;
          e.currentTarget.style.boxShadow = "";
          e.currentTarget.style.transform = "";
        }
        externalMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!isInert) {
          e.currentTarget.style.transform = "scale(0.96)";
          e.currentTarget.style.boxShadow = v.activeShadow;
        }
        externalMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        if (!isInert) {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = v.hoverShadow !== "none" ? v.hoverShadow : "";
        }
        externalMouseUp?.(e);
      }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
