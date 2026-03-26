import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../encryption";

describe("encryption", () => {
  it("encrypts a string to a non-empty ciphertext", () => {
    const plaintext = "my-secret-password";
    const ciphertext = encrypt(plaintext);
    expect(ciphertext).toBeTruthy();
    expect(ciphertext).not.toBe(plaintext);
  });

  it("decrypts ciphertext back to the original plaintext", () => {
    const plaintext = "my-secret-password";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);
    expect(result).toBe(plaintext);
  });

  it("produces different ciphertext for different inputs", () => {
    const a = encrypt("password-a");
    const b = encrypt("password-b");
    expect(a).not.toBe(b);
  });

  it("handles empty string", () => {
    const ciphertext = encrypt("");
    const result = decrypt(ciphertext);
    expect(result).toBe("");
  });

  it("handles special characters", () => {
    const plaintext = "p@$$w0rd!#%^&*()_+{}|:<>?";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);
    expect(result).toBe(plaintext);
  });

  it("handles unicode characters", () => {
    const plaintext = "password-with-emoji-and-kanji";
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);
    expect(result).toBe(plaintext);
  });
});
