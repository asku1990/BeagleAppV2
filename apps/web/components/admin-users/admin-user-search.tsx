"use client";

import { Input } from "@/components/ui/input";

type AdminUserSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
};

export function AdminUserSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
}: AdminUserSearchProps) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  );
}
