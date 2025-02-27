# Scripts

This directory contains utility scripts for the application.

## API Key Migration

The `migrate-api-keys.ts` script is used to migrate existing API keys to be hashed. This should be run after deploying the code changes that implement API key hashing.

### Usage

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the migration script
npx ts-node scripts/migrate-api-keys.ts
```

### What it does

1. Retrieves all API keys from the database
2. For each API key that is not already hashed (doesn't contain a colon), it:
   - Hashes the API key using the same hashing function used in the application
   - Updates the API key in the database with the hashed value
3. Logs the progress and results of the migration

### Environment Variables

The script requires the `API_KEY_SECRET` environment variable to be set in the `.env` file. This should be the same secret used by the application for hashing and unhashing API keys. 