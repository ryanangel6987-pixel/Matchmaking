"use client";

interface MultiSelectPillsProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  icon?: string;
}

export function MultiSelectPills({ label, options, selected, onChange, icon }: MultiSelectPillsProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
            {icon}
          </span>
        )}
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-gold text-on-gold shadow-md"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SingleSelectPillsProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (selected: string) => void;
  icon?: string;
}

export function SingleSelectPills({ label, options, selected, onChange, icon }: SingleSelectPillsProps) {
  return (
    <div className="space-y-2">
      <p className="text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
        {icon && (
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
            {icon}
          </span>
        )}
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(isSelected ? "" : option)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-gold text-on-gold shadow-md"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
