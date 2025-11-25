import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  isValidPassword,
  generateToken,
} from "./auth";

describe("Authentication Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash a password", () => {
      const password = "TestPassword123";
      const hash = hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).toContain("$");
      expect(hash.split("$")).toHaveLength(2);
    });

    it("should generate different hashes for the same password", () => {
      const password = "TestPassword123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify correct password", () => {
      const password = "TestPassword123";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "TestPassword123";
      const hash = hashPassword(password);

      expect(verifyPassword("WrongPassword123", hash)).toBe(false);
    });

    it("should reject malformed hash", () => {
      expect(verifyPassword("TestPassword123", "malformed")).toBe(false);
      expect(verifyPassword("TestPassword123", "no$separator")).toBe(false);
    });
  });

  describe("Email Validation", () => {
    it("should validate correct email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
      expect(isValidEmail("researcher+tag@institution.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should validate strong passwords", () => {
      expect(isValidPassword("TestPassword123")).toBe(true);
      expect(isValidPassword("MySecurePass99")).toBe(true);
      expect(isValidPassword("Complex@Pass1")).toBe(true);
    });

    it("should reject passwords shorter than 8 characters", () => {
      expect(isValidPassword("Short1A")).toBe(false);
      expect(isValidPassword("Pass1")).toBe(false);
    });

    it("should reject passwords without uppercase letters", () => {
      expect(isValidPassword("testpassword123")).toBe(false);
    });

    it("should reject passwords without lowercase letters", () => {
      expect(isValidPassword("TESTPASSWORD123")).toBe(false);
    });

    it("should reject passwords without numbers", () => {
      expect(isValidPassword("TestPassword")).toBe(false);
    });

    it("should accept passwords with exactly 8 characters if they meet all requirements", () => {
      expect(isValidPassword("TestPass1")).toBe(true);
    });
  });

  describe("Token Generation", () => {
    it("should generate a token", () => {
      const token = generateToken();
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate hex tokens", () => {
      const token = generateToken();
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });
  });
});
