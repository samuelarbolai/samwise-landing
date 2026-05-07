"use client";

import type { ReactNode } from "react";
import { COLORS } from "./tokens";

type Props = {
  label: string;
  caption?: string;
  children?: ReactNode;
};

export function Aperture({ label, caption, children }: Props) {
  return (
    <figure style={{ margin: "24px 0" }}>
      <div
        aria-label={label}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          border: `1px solid ${COLORS.horizon}`,
          background: COLORS.bg,
          color: COLORS.horizon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          textAlign: "center",
          padding: "20px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children ?? <span>{label}</span>}
      </div>
      {caption && (
        <figcaption
          style={{
            marginTop: "8px",
            color: COLORS.horizon,
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
