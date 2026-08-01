import type { SpecialType, Suit } from "../../core/types.ts";

/**
 * Premium nautical deck palette.
 * Suit = bold panel color; specials = ink field + gold foil.
 */
export const SUIT: Record<
  Suit,
  { panel: string; panelDark: string; ink: string; label: string; mark: string }
> = {
  yellow: {
    panel: "#E8B923",
    panelDark: "#B8860B",
    ink: "#1A1408",
    label: "OR",
    mark: "doubloon",
  },
  green: {
    panel: "#2F8F5B",
    panelDark: "#1A5C38",
    ink: "#F4FFF8",
    label: "ÎLE",
    mark: "isle",
  },
  blue: {
    panel: "#2B6CB0",
    panelDark: "#1A3F70",
    ink: "#F2F8FF",
    label: "MER",
    mark: "wave",
  },
  black: {
    panel: "#2A2430",
    panelDark: "#121018",
    ink: "#F5E6C8",
    label: "ATOUT",
    mark: "skull",
  },
};

export const SPECIAL: Record<
  SpecialType,
  { field: string; fieldDark: string; foil: string; ink: string; title: string; glyph: string }
> = {
  escape: {
    field: "#3D4654",
    fieldDark: "#1E2430",
    foil: "#C5CBD4",
    ink: "#F4F6F8",
    title: "FUITE",
    glyph: "flag",
  },
  pirate: {
    field: "#5C2A0E",
    fieldDark: "#2A1206",
    foil: "#F0A020",
    ink: "#FFF4E0",
    title: "PIRATE",
    glyph: "jolly",
  },
  mermaid: {
    field: "#0E5A62",
    fieldDark: "#063038",
    foil: "#3ECFDB",
    ink: "#E8FFFC",
    title: "SIRÈNE",
    glyph: "mermaid",
  },
  skullKing: {
    field: "#3A2048",
    fieldDark: "#1A0E22",
    foil: "#E0C050",
    ink: "#FFF8E0",
    title: "ROI DES CRÂNES",
    glyph: "crown",
  },
  tigress: {
    field: "#7A3A10",
    fieldDark: "#3A1A06",
    foil: "#FF9A3C",
    ink: "#FFF0E0",
    title: "TIGRESSE",
    glyph: "paw",
  },
};
