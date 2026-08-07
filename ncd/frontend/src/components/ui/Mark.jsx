import React from "react";
import { T } from "../../lib/theme";

export function Mark({ dark = false, size = 22 }) {
  const word = dark ? T.paperRaised : T.charcoal900;
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: size,
          color: word,
          letterSpacing: "-0.02em",
        }}
      >
        icc<span style={{ color: T.gold }}>+</span>
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: T.ink,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: size * 0.42,
          color: dark ? "#C9C6BC" : T.charcoal500,
          letterSpacing: "0.04em",
        }}
      >
        by yrg care
      </span>
    </div>
  );
}
