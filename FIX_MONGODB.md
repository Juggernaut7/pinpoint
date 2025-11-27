# Fix MongoDB Connection

## Issue
Your MongoDB URI is missing the database name and query parameters.

## Current URI (in `.env.local`)
```
MONGODB_URI=mongodb+srv://abdulkabir0600_db_user:pinpoint@cluster0.segzqf4.mongodb.net/
```

## Fixed URI (what it should be)
```
MONGODB_URI=mongodb+srv://abdulkabir0600_db_user:pinpoint@cluster0.segzqf4.mongodb.net/pinpoint?retryWrites=true&w=majority
```

## How to Fix

1. Open `apps/web/.env.local`
2. Find the line with `MONGODB_URI=`
3. Change it from:
   ```
   MONGODB_URI=mongodb+srv://abdulkabir0600_db_user:pinpoint@cluster0.segzqf4.mongodb.net/
   ```
   To:
   ```
   MONGODB_URI=mongodb+srv://abdulkabir0600_db_user:pinpoint@cluster0.segzqf4.mongodb.net/pinpoint?retryWrites=true&w=majority
   ```

4. **Restart your dev server** (Ctrl+C, then `pnpm dev`)

## Verify

After restarting, test:
```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "checks": {
    "mongodb_connection": "CONNECTED",
    ...
  }
}
```

## Note
The code now auto-fixes URIs missing the database name, but it's better to have the correct format in your `.env.local` file.

