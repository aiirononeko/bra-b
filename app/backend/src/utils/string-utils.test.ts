import { describe, it, expect } from "vitest";
import { toUpperCase, toLowerCase, reverse, isEmpty, removeWhitespace } from "./string-utils";

describe("String Utilities", () => {
  describe("toUpperCase", () => {
    it("converts a string to uppercase", () => {
      expect(toUpperCase("hello")).toBe("HELLO");
      expect(toUpperCase("Hello World")).toBe("HELLO WORLD");
      expect(toUpperCase("123")).toBe("123");
    });

    it("returns an empty string when given an empty string", () => {
      expect(toUpperCase("")).toBe("");
    });
  });

  describe("toLowerCase", () => {
    it("converts a string to lowercase", () => {
      expect(toLowerCase("HELLO")).toBe("hello");
      expect(toLowerCase("Hello World")).toBe("hello world");
      expect(toLowerCase("123")).toBe("123");
    });

    it("returns an empty string when given an empty string", () => {
      expect(toLowerCase("")).toBe("");
    });
  });

  describe("reverse", () => {
    it("reverses a string", () => {
      expect(reverse("hello")).toBe("olleh");
      expect(reverse("Hello World")).toBe("dlroW olleH");
      expect(reverse("123")).toBe("321");
    });

    it("returns an empty string when given an empty string", () => {
      expect(reverse("")).toBe("");
    });
  });

  describe("isEmpty", () => {
    it("returns true for empty strings", () => {
      expect(isEmpty("")).toBe(true);
      expect(isEmpty("   ")).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it("returns false for non-empty strings", () => {
      expect(isEmpty("hello")).toBe(false);
      expect(isEmpty(" hello ")).toBe(false);
      expect(isEmpty("123")).toBe(false);
    });
  });

  describe("removeWhitespace", () => {
    it("removes all whitespace from a string", () => {
      expect(removeWhitespace("hello world")).toBe("helloworld");
      expect(removeWhitespace("  hello  world  ")).toBe("helloworld");
      expect(removeWhitespace("hello\nworld")).toBe("helloworld");
      expect(removeWhitespace("hello\tworld")).toBe("helloworld");
    });

    it("returns an empty string when given an empty string", () => {
      expect(removeWhitespace("")).toBe("");
      expect(removeWhitespace("   ")).toBe("");
    });
  });
});
