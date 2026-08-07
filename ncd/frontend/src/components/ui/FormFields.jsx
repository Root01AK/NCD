import React from "react";
import { T } from "../../lib/theme";

export function FieldLabel({ children }) {
  return (
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}
    >
      {children}
    </label>
  );
}

export function TextField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: `1px solid ${T.line}`, background: T.paperRaised, color: T.ink }}
      />
    </div>
  );
}

export function RadioField({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        {options.map((opt) => {
          const isObj = typeof opt === "object";
          const optValue = isObj ? opt.value : opt;
          const optLabel = isObj ? opt.label : opt;
          return (
            <button
              type="button"
              key={optValue}
              onClick={() => onChange(optValue)}
              className="flex-1 rounded-lg px-2 py-2.5 text-xs font-medium"
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                border: `1px solid ${value === optValue ? T.ink : T.line}`,
                background: value === optValue ? T.ink : T.paperRaised,
                color: value === optValue ? T.paperRaised : T.charcoal700,
              }}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SelectField({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: `1px solid ${T.line}`, background: T.paperRaised, color: T.ink }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
