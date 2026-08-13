import React from "react";
import { T } from "../../lib/theme";

export function Mark({ dark = false, size = 22, showSub = false }) {
  const word = dark ? T.paperRaised : T.charcoal900;
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: size,
          color: word,
          letterSpacing: "-0.02em",
        }}
      >
        NCD<span style={{ color: T.goldDeep }}>.</span>
      </span>
      {showSub && (
        <>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 999,
              background: T.goldDeep,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: size * 0.45,
              fontWeight: 600,
              color: dark ? "#CBD5E1" : T.charcoal500,
              letterSpacing: "0.02em",
            }}
          >
            Non-Communicable Disease
          </span>
        </>
      )}
    </div>
  );
}
