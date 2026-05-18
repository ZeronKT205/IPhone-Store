interface BadgeProps {
  variant: "success" | "danger" | "warning" | "neutral" | "brand";
  children: React.ReactNode;
  dot?: boolean;
}

const styles = {
  success: { bg: "var(--color-success-bg)", color: "var(--color-success)", dot: "#16A34A" },
  danger:  { bg: "var(--color-danger-bg)",  color: "var(--color-danger)",  dot: "#DC2626" },
  warning: { bg: "var(--color-warning-bg)", color: "var(--color-warning)", dot: "#D97706" },
  neutral: { bg: "#F3F2EE",                color: "var(--color-text-muted)", dot: "#9E9B94" },
  brand:   { bg: "var(--color-brand-100)", color: "var(--color-brand-dark)", dot: "var(--color-brand)" },
};

export default function Badge({ variant, children, dot = false }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color, borderRadius: "var(--radius)" }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: s.dot }}
        />
      )}
      {children}
    </span>
  );
}
