import { describe, it, expect } from "vitest";
import { isPasswordStrong, validatePassword } from "./password";

describe("isPasswordStrong", () => {
  it("returns false for passwords shorter than 8 characters", () => {
    expect(isPasswordStrong("Ab1!")).toBe(false);
  });

  it("returns false when missing letters", () => {
    expect(isPasswordStrong("12345678!")).toBe(false);
  });

  it("returns false when missing digits", () => {
    expect(isPasswordStrong("AbcdefgH!")).toBe(false);
  });

  it("returns false when missing special characters", () => {
    expect(isPasswordStrong("Abcdefg1")).toBe(false);
  });

  it("returns true for a strong password", () => {
    expect(isPasswordStrong("Secure1!")).toBe(true);
  });

  it("returns true regardless of special character type", () => {
    expect(isPasswordStrong("Pass1234@")).toBe(true);
    expect(isPasswordStrong("Pass1234#")).toBe(true);
    expect(isPasswordStrong("Pass1234_")).toBe(true);
  });
});

describe("validatePassword", () => {
  it("returns invalid with error when password is empty", () => {
    expect(validatePassword("")).toEqual({ valid: false, error: "Password required!" });
  });

  it("returns valid for any non-empty password without requireStrong", () => {
    expect(validatePassword("weak")).toEqual({ valid: true });
  });

  it("returns invalid when requireStrong and password is weak", () => {
    const result = validatePassword("weak", { requireStrong: true });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/8 characters/);
  });

  it("returns valid when requireStrong and password meets criteria", () => {
    expect(validatePassword("Secure1!", { requireStrong: true })).toEqual({ valid: true });
  });
});
