"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string[];
};

type ComboboxProps = {
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  clearLabel?: string;
  disabled?: boolean;
};

export function Combobox({
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel = "No results",
  clearLabel = "Clear",
  disabled = false,
}: ComboboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }
      if (rootRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return options;
    }

    return options.filter((option) => {
      if (option.label.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return (option.keywords ?? []).some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [options, query]);
  const activeItemIndex = Math.min(
    activeIndex,
    Math.max(filteredOptions.length - 1, 0),
  );
  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  return (
    <div className="relative" ref={rootRef}>
      <Input
        value={displayValue}
        disabled={disabled}
        placeholder={isOpen ? searchPlaceholder : placeholder}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
          setActiveIndex(0);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (!isOpen) {
            return;
          }

          if (event.key === "Escape") {
            setIsOpen(false);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)),
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
          }

          if (event.key === "Enter") {
            const selected = filteredOptions[activeItemIndex];
            if (!selected) {
              return;
            }
            event.preventDefault();
            onChange(selected.value);
            setQuery(selected.label);
            setIsOpen(false);
          }
        }}
      />

      {isOpen ? (
        <div
          className={cn(
            "bg-popover text-popover-foreground absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border p-1 shadow-md",
          )}
        >
          <button
            type="button"
            className="focus:bg-accent focus:text-accent-foreground block w-full rounded-sm px-2 py-1.5 text-left text-sm outline-hidden"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              setQuery("");
              setIsOpen(false);
            }}
          >
            {clearLabel}
          </button>
          {filteredOptions.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-sm">
              {emptyLabel}
            </p>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "focus:bg-accent focus:text-accent-foreground block w-full rounded-sm px-2 py-1.5 text-left text-sm outline-hidden",
                  index === activeItemIndex
                    ? "bg-accent text-accent-foreground"
                    : "",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
