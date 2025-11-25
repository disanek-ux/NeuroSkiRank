import { describe, it, expect } from "vitest";
import { calculatePublicationScore } from "./ranking";
import type { Publication } from "../drizzle/schema";

describe("Ranking Algorithm", () => {
  describe("calculatePublicationScore", () => {
    const currentYear = new Date().getFullYear();

    it("should calculate base score of 10 for any publication", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Test Journal",
        year: currentYear,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.baseScore).toBe(10);
    });

    it("should give +10 bonus for publications within last year", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Test Journal",
        year: currentYear,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.recencyBonus).toBe(10);
      expect(score.totalScore).toBe(20); // base 10 + recency 10
    });

    it("should give +5 bonus for publications within last 3 years", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Test Journal",
        year: currentYear - 2,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.recencyBonus).toBe(5);
      expect(score.totalScore).toBe(15); // base 10 + recency 5
    });

    it("should give +2 bonus for publications within last 5 years", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Test Journal",
        year: currentYear - 4,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.recencyBonus).toBe(2);
      expect(score.totalScore).toBe(12); // base 10 + recency 2
    });

    it("should give +1 bonus for older publications", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Test Journal",
        year: currentYear - 10,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.recencyBonus).toBe(1);
      expect(score.totalScore).toBe(11); // base 10 + recency 1
    });

    it("should give +5 bonus for high-impact journals", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Nature",
        year: currentYear,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.impactBonus).toBe(5);
      expect(score.totalScore).toBe(25); // base 10 + recency 10 + impact 5
    });

    it("should give 0 bonus for non-high-impact journals", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Regular Journal",
        year: currentYear,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.impactBonus).toBe(0);
      expect(score.totalScore).toBe(20); // base 10 + recency 10
    });

    it("should combine all bonuses correctly", () => {
      const pub: Publication = {
        id: 1,
        userId: 1,
        doi: "10.1234/test",
        title: "Test Publication",
        authors: ["Author One"],
        journal: "Science",
        year: currentYear,
        abstract: null,
        publicationType: "journal-article",
        createdAt: new Date(),
      };

      const score = calculatePublicationScore(pub);
      expect(score.baseScore).toBe(10);
      expect(score.recencyBonus).toBe(10);
      expect(score.impactBonus).toBe(5);
      expect(score.totalScore).toBe(25);
    });
  });
});
