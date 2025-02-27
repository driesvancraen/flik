import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hashes an API key for secure storage
 * @param apiKey The API key to hash
 * @returns The hashed API key
 */
export function hashApiKey(apiKey: string): string {
  // Use environment variable for the secret key, or a default if not set
  const secretKey = process.env.API_KEY_SECRET || "default-secret-key-change-in-production";
  
  // Create an initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey.padEnd(32).slice(0, 32)), iv);
  
  // Encrypt the API key
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Return the IV and encrypted data as a single string
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Unhashes (decrypts) a previously hashed API key
 * @param hashedApiKey The hashed API key to decrypt
 * @returns The original API key
 */
export function unhashApiKey(hashedApiKey: string): string {
  try {
    // Use environment variable for the secret key, or a default if not set
    const secretKey = process.env.API_KEY_SECRET || "default-secret-key-change-in-production";
    
    // Split the stored hash into IV and encrypted parts
    const [ivHex, encryptedData] = hashedApiKey.split(":");
    
    // Convert hex IV back to Buffer
    const iv = Buffer.from(ivHex, "hex");
    
    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey.padEnd(32).slice(0, 32)), iv);
    
    // Decrypt the API key
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Error unhashing API key:", error);
    throw new Error("Failed to decrypt API key");
  }
} 