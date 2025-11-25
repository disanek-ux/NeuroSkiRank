import { describe, it, expect } from "vitest";
import {
  isValidDoi,
  normalizeDoi,
  isHighImpactJournal,
} from "./crossref";

describe("Crossref Integration", () => {
  describe("DOI Validation", () => {
    it("should validate correct DOI format", () => {
      expect(isValidDoi("10.1234/test")).toBe(true);
      expect(isValidDoi("10.1038/nature12373")).toBe(true);
      expect(isValidDoi("10.1016/j.cell.2021.01.001")).toBe(true);
    });

    it("should validate DOI with URL prefix", () => {
      expect(isValidDoi("https://doi.org/10.1234/test")).toBe(true);
      expect(isValidDoi("http://doi.org/10.1234/test")).toBe(true);
      expect(isValidDoi("https://dx.doi.org/10.1234/test")).toBe(true);
    });

    it("should reject invalid DOI format", () => {
      expect(isValidDoi("invalid")).toBe(false);
      expect(isValidDoi("doi:10.1234/test")).toBe(false);
      expect(isValidDoi("10.")).toBe(false);
      expect(isValidDoi("")).toBe(false);
    });
  });

  describe("DOI Normalization", () => {
    it("should normalize DOI with URL prefix", () => {
      expect(normalizeDoi("https://doi.org/10.1234/test")).toBe("10.1234/test");
      expect(normalizeDoi("http://doi.org/10.1234/test")).toBe("10.1234/test");
      expect(normalizeDoi("https://dx.doi.org/10.1234/test")).toBe("10.1234/test");
    });

    it("should convert DOI to lowercase", () => {
      expect(normalizeDoi("10.1234/TEST")).toBe("10.1234/test");
      expect(normalizeDoi("10.1038/NATURE12373")).toBe("10.1038/nature12373");
    });

    it("should handle plain DOI", () => {
      expect(normalizeDoi("10.1234/test")).toBe("10.1234/test");
    });
  });

  describe("High Impact Journal Detection", () => {
    it("should identify high-impact journals", () => {
      expect(isHighImpactJournal("Nature")).toBe(true);
      expect(isHighImpactJournal("Science")).toBe(true);
      expect(isHighImpactJournal("Cell")).toBe(true);
      expect(isHighImpactJournal("Lancet")).toBe(true);
      expect(isHighImpactJournal("Nature Neuroscience")).toBe(true);
      expect(isHighImpactJournal("Neuron")).toBe(true);
    });

    it("should be case-insensitive", () => {
      expect(isHighImpactJournal("nature")).toBe(true);
      expect(isHighImpactJournal("SCIENCE")).toBe(true);
      expect(isHighImpactJournal("NaTuRe")).toBe(true);
    });

    it("should reject non-high-impact journals", () => {
      expect(isHighImpactJournal("Regular Journal")).toBe(false);
      expect(isHighImpactJournal("Unknown Publication")).toBe(false);
      expect(isHighImpactJournal("")).toBe(false);
    });

    it("should handle null/undefined", () => {
      expect(isHighImpactJournal("")).toBe(false);
    });
  });
});
