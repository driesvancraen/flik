/**
 * This script migrates existing API keys to be hashed.
 * Run this script after deploying the code changes that implement API key hashing.
 * 
 * Usage: npx ts-node scripts/migrate-api-keys.ts
 */

import { PrismaClient } from "@prisma/client";
import { hashApiKey } from "../src/lib/utils";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function migrateApiKeys() {
  console.log("Starting API key migration...");
  
  try {
    // Get all API keys
    const apiKeys = await prisma.apiKey.findMany();
    console.log(`Found ${apiKeys.length} API keys to migrate.`);
    
    let migratedCount = 0;
    
    // Process each API key
    for (const apiKey of apiKeys) {
      try {
        // Skip keys that are already hashed (they contain a colon which separates IV and encrypted data)
        if (apiKey.key.includes(":")) {
          console.log(`API key ${apiKey.id} appears to be already hashed, skipping.`);
          continue;
        }
        
        // Hash the API key
        const hashedKey = hashApiKey(apiKey.key);
        
        // Update the API key in the database
        await prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { key: hashedKey },
        });
        
        migratedCount++;
        console.log(`Migrated API key ${apiKey.id} for provider ${apiKey.provider}.`);
      } catch (error) {
        console.error(`Error migrating API key ${apiKey.id}:`, error);
      }
    }
    
    console.log(`Migration complete. Successfully migrated ${migratedCount} API keys.`);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateApiKeys()
  .then(() => {
    console.log("Migration script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  }); 