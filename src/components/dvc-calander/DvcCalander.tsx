import React, { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange, Matcher } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "react-day-picker/style.css";

type Mode = "single" | "multiple" | "range";
type Value = Date | Date[] | DateRange | undefined;

interface DvcCalanderProps {
  mode?: Mode;
  value?: Value | null;
  onChange?: (value: Value) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean | Matcher | Matcher[];
  placeholder?: string;
  className?: string;
  numberOfMonths?: number;
}

const formatDisplay = (value: Value | null | undefined): string => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (Array.isArray(value)) {
    return `${value.length} date${value.length === 1 ? "" : "s"}`;
  }
  if ("from" in value && value.from) {
    const to = value.to ? ` – ${value.to.toLocaleDateString()}` : "";
    return `${value.from.toLocaleDateString()}${to}`;
  }
  return "";
};

const DvcCalander: React.FC<DvcCalanderProps> = ({
  mode = "single",
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Pick a date",
  className = "",
  numberOfMonths = 1,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [internal, setInternal] = useState<Value>(undefined);
  const isControlled = value !== undefined;
  const selected = isControlled ? (value ?? undefined) : internal;

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelect = (next: any) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
    // Auto-close in single mode
    if (mode === "single") setOpen(false);
  };

  // Combine disabled + min/max into a matcher array
  const combinedDisabled: Matcher[] = [
    ...(Array.isArray(disabled) ? disabled : disabled ? [disabled] : []),
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) setInternal(undefined);
    onChange?.(undefined);
  };

  const display = formatDisplay(selected);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg
                   bg-zinc-50 ring-1 ring-zinc-200 text-left
                   hover:bg-zinc-100
                   focus:ring-2 focus:ring-blue-500 focus:bg-white
                   outline-none transition-all"
      >
        <CalendarIcon size={14} className="text-zinc-400 shrink-0" />
        <span className={`flex-1 truncate ${display ? "text-zinc-700" : "text-zinc-400"}`}>
          {display || placeholder}
        </span>
        {display && (
          <span
            onClick={clear}
            className="p-0.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700"
            aria-label="Clear date"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute -top-[800%] z-50 mt-1 p-3 bg-white rounded-xl ring-1 ring-zinc-200 shadow-lg">
          <DayPicker
            mode={mode as any}
            selected={selected as any}
            onSelect={handleSelect}
            disabled={combinedDisabled}
            numberOfMonths={numberOfMonths}
            showOutsideDays
            fixedWeeks
            weekStartsOn={1}
            classNames={{
              root: "rdp",
              months: "flex flex-col gap-4",
              month: "flex flex-col gap-4",
              month_caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-zinc-900",
              nav: "absolute top-0 inset-x-0 flex justify-between items-center h-9 px-1",
              button_previous:
                "inline-flex items-center justify-center size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-zinc-600",
              button_next:
                "inline-flex items-center justify-center size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-zinc-600",
              chevron: "size-4 fill-zinc-500",
              weekdays: "flex",
              weekday: "w-9 text-[0.8rem] font-normal text-zinc-500",
              week: "flex w-full mt-2",
              day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day_button:
                "size-9 p-0 font-normal rounded-md text-zinc-700 hover:bg-zinc-100 aria-selected:opacity-100 cursor-pointer",
              selected:
                "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white focus:bg-zinc-900 focus:text-white rounded-md",
              range_start: "bg-zinc-900 text-white rounded-l-md rounded-r-none",
              range_end: "bg-zinc-900 text-white rounded-r-md rounded-l-none",
              range_middle: "bg-zinc-100 text-zinc-900 rounded-none",
              today: "bg-zinc-100 font-semibold",
              outside: "text-zinc-400 opacity-50",
              disabled: "text-zinc-300 opacity-50 cursor-not-allowed",
              hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DvcCalander;