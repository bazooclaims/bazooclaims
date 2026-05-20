"use client";

import { inputClass, labelClass } from "@/components/admin/admin-ui";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  disabled?: boolean;
  label?: string;
  hint?: string;
};

export function StaffRoleInput({
  value,
  onChange,
  suggestions,
  disabled,
  label = "Role",
  hint = "Any label — e.g. Claims handler, Office manager. Use “admin” for full admin access.",
}: Props) {
  const listId = "staff-role-suggestions";

  return (
    <label className={labelClass}>
      {label}
      <input
        className={inputClass}
        list={listId}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Claims handler"
        required
      />
      <datalist id={listId}>
        {suggestions.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--color-ink-muted)]">{hint}</span> : null}
    </label>
  );
}
