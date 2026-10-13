/**
 * Sandbox compiler config: pure helpers only (no compiler import here,
 * so pages displaying the version never ship it).
 */
import { describe, expect, it } from "vitest";
import ts from "typescript6";
import {
  compilerLabel,
  findBannedTs,
  findImportExport,
  narrowedTypeAtLine,
  parseFenceMeta,
  SANDBOX_TS_VERSION,
} from "../src/lib/ts-compiler";

describe("ts-compiler config", () => {
  it("pins the expected runtime compiler", () => {
    expect(SANDBOX_TS_VERSION).toBe("6.0.3");
    expect(compilerLabel(null)).toBe("Checked with TypeScript 6.0.3, strict mode");
    expect(compilerLabel(false)).toBe("Checked with TypeScript 6.0.3, strict off");
  });

  it("parses fence meta", () => {
    expect(parseFenceMeta('{error="TS2322"}')).toEqual({
      errors: ["TS2322"],
      strict: null,
    });
    expect(parseFenceMeta('{error="TS2322,TS2345" strict=false}')).toEqual({
      errors: ["TS2322", "TS2345"],
      strict: false,
    });
    expect(parseFenceMeta('{highlight="3-5"}')).toEqual({ errors: [], strict: null });
    expect(parseFenceMeta("")).toEqual({ errors: [], strict: null });
  });

  it("flags banned escape hatches, ignoring prose", () => {
    expect(findBannedTs("const x: any = 1;")).toHaveLength(1);
    expect(findBannedTs("// uses `any` in a comment\nconst x = 1;")).toEqual([]);
    expect(findBannedTs("const s: string = x as string;")).toEqual([]);
    expect(findBannedTs("// @ts-ignore\nconst x = 1;")).toHaveLength(1);
    expect(findBannedTs("const y = x!;")).toHaveLength(1);
    expect(findBannedTs("if (a !== b && !ready) {}")).toEqual([]);
  });

  it("flags imports and exports", () => {
    expect(findImportExport('import type { A } from "./a";')).toHaveLength(1);
    expect(findImportExport("export const x = 1;")).toHaveLength(1);
    expect(findImportExport("// import nothing\nconst x = 1;")).toEqual([]);
  });

  it("resolves narrowed types without libs", () => {
    const code = [
      "declare const order: { status: string } | null;",
      "if (order !== null) {",
      "  console.log(order.status);",
      "}",
    ].join("\n");
    expect(narrowedTypeAtLine(ts, code, true, 3, "order.status")).toBe("string");
    expect(narrowedTypeAtLine(ts, code, true, 3, "order.missing")).toBeUndefined();
  });
});