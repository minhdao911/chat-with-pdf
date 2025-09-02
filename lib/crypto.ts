/**
 * Crypto utilities for encrypting/decrypting API keys in localStorage
 * Uses crypto-js library for secure client-side encryption
 */

"use client";

import CryptoJS from "crypto-js";
import { logger } from "./logger";

// Fixed salt for key derivation (in production, this should be environment-specific)
const ENCRYPTION_SALT = "chat-pdf-app-salt-2024";
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives an encryption key from user ID using PBKDF2
 */
function deriveKey(userId: string): string {
  return CryptoJS.PBKDF2(userId + ENCRYPTION_SALT, ENCRYPTION_SALT, {
    keySize: 256 / 32, // 256 bits / 32 bits per word
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  }).toString();
}

/**
 * Encrypts data using AES-256-CBC
 */
export function encryptData(data: string, userId: string): string {
  try {
    if (!userId) {
      throw new Error("User ID is required for encryption");
    }

    const key = deriveKey(userId);
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();

    return encrypted;
  } catch (error) {
    logger.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts data using AES-256-CBC
 */
export function decryptData(encryptedData: string, userId: string): string {
  try {
    if (!userId) {
      throw new Error("User ID is required for decryption");
    }

    const key = deriveKey(userId);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Failed to decrypt data - invalid key or corrupted data");
    }

    return decryptedString;
  } catch (error) {
    logger.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Checks if crypto-js is available and we're on client-side
 */
export function isCryptoAvailable(): boolean {
  return typeof window !== "undefined" && typeof CryptoJS !== "undefined";
}
