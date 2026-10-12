import type { ThemeRegistration } from "shiki";

export const palette = {
  light: {
    bg: "#ffffff",
    fg: "#24292f",
    keyword: "#6639ba",
    string: "#0a6445",
    number: "#953800",
    function: "#0550ae",
    comment: "#57606a",
    variable: "#9a1c40",
  },
  dark: {
    bg: "#1c1917",
    fg: "#e7e5e4",
    keyword: "#c4b5fd",
    string: "#86efac",
    number: "#fbbf24",
    function: "#93c5fd",
    comment: "#a8a29e",
    variable: "#f9a8d4",
  },
};

function makeTheme(mode: "light" | "dark"): ThemeRegistration {
  const p = palette[mode];
  return {
    name: `learn-${mode}`,
    type: mode,
    colors: { "editor.background": p.bg, "editor.foreground": p.fg },
    tokenColors: [
      {
        scope: ["keyword", "storage", "punctuation.definition.tag"],
        settings: { foreground: p.keyword },
      },
      { scope: ["string"], settings: { foreground: p.string } },
      {
        scope: ["constant.numeric", "constant.language"],
        settings: { foreground: p.number },
      },
      {
        scope: ["entity.name.function", "support.function"],
        settings: { foreground: p.function },
      },
      { scope: ["comment"], settings: { foreground: p.comment } },
      {
        scope: ["variable", "entity.name.tag", "entity.other.attribute-name"],
        settings: { foreground: p.variable },
      },
    ],
  };
}
export const lightTheme = makeTheme("light");
export const darkTheme = makeTheme("dark");
