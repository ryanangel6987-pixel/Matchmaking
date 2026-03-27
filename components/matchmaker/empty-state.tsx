import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-10 text-center space-y-3">
      <span
        className="material-symbols-outlined text-4xl text-outline/30 block"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
      >
        {icon}
      </span>
      <h3 className="text-on-surface font-heading font-semibold text-sm">{title}</h3>
      {description && (
        <p className="text-on-surface-variant text-xs max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors mt-2"
        >
          {actionLabel}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors mt-2"
        >
          {actionLabel}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      )}
    </div>
  );
}
