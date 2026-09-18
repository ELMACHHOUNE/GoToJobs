import { describe, it, expect } from "vitest";
import { normalizeSkill, SKILL_ALIASES } from "./normalizeSkill";

describe("normalizeSkill", () => {
  it("normalizes known aliases to canonical form", () => {
    expect(normalizeSkill("ReactJS")).toBe("react");
    expect(normalizeSkill("react.js")).toBe("react");
    expect(normalizeSkill("REACT")).toBe("react");
    expect(normalizeSkill("NextJS")).toBe("next.js");
    expect(normalizeSkill("next.js")).toBe("next.js");
    expect(normalizeSkill("Node")).toBe("node.js");
    expect(normalizeSkill("nodejs")).toBe("node.js");
    expect(normalizeSkill("TS")).toBe("typescript");
    expect(normalizeSkill("TypeScript")).toBe("typescript");
    expect(normalizeSkill("JS")).toBe("javascript");
    expect(normalizeSkill("JavaScript")).toBe("javascript");
    expect(normalizeSkill("k8s")).toBe("kubernetes");
    expect(normalizeSkill("K8s")).toBe("kubernetes");
    expect(normalizeSkill("AWS")).toBe("aws");
    expect(normalizeSkill("ExpressJS")).toBe("express");
    expect(normalizeSkill("Mongo")).toBe("mongodb");
    expect(normalizeSkill("PostgreSQL")).toBe("postgresql");
  });

  it("returns cleaned input when no alias exists", () => {
    expect(normalizeSkill("  Rust  ")).toBe("rust");
    expect(normalizeSkill("Elm")).toBe("elm");
    expect(normalizeSkill("Haskell")).toBe("haskell");
  });

  it("handles edge cases", () => {
    expect(normalizeSkill("")).toBe("");
    expect(normalizeSkill("   ")).toBe("");
  });
});

describe("SKILL_ALIASES", () => {
  it("has no duplicate keys", () => {
    const keys = Object.keys(SKILL_ALIASES);
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });

  it("contains expected core skills", () => {
    expect(SKILL_ALIASES.reactjs).toBe("react");
    expect(SKILL_ALIASES.nextjs).toBe("next.js");
    expect(SKILL_ALIASES.node).toBe("node.js");
    expect(SKILL_ALIASES.ts).toBe("typescript");
    expect(SKILL_ALIASES.js).toBe("javascript");
    expect(SKILL_ALIASES.k8s).toBe("kubernetes");
    expect(SKILL_ALIASES.aws).toBe("aws");
    expect(SKILL_ALIASES.docker).toBe("docker");
    expect(SKILL_ALIASES.git).toBe("git");
  });
});