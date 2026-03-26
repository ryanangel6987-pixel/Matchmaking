"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "" }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#0a0a0a] border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-pointer"
      >
        <span className={selected ? "text-white" : "text-outline"}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className="material-symbols-outlined text-gold text-base transition-transform duration-200"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 300",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#0a0a0a] border border-outline-variant/20 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-[#1c1b1b] text-gold"
                    : "text-white hover:bg-[#1c1b1b] hover:text-gold"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
