# Data Persistence During Deployment

## Overview

The `/data/` directory is now gitignored to prevent deployment from overwriting production data on the server.

## Files Protected

The following files persist across deployments:

- **`/data/donations.json`** - Donation records
- **`/data/feedback.json`** - User feedback submissions
- **`/data/song-ideas.json`** - Song request/voting data
- **`/data/metrics.json`** - Site visit metrics

## How It Works

1. `/data/` directory is in `.gitignore`
2. Local changes to code won't include data directory
3. When you deploy, server data files remain untouched ✨
4. Only code/static assets get updated

## Initial Setup on New Server

If deploying to a fresh server, you'll need to create empty JSON files:

```bash
mkdir -p data
echo '[]' > data/donations.json
echo '[]' > data/feedback.json
echo '[]' > data/song-ideas.json
echo '{"visits":0}' > data/metrics.json
```

Or you can let the app create them automatically on first request.

## Backup Production Data

To backup production data from your server:

```bash
# SSH into your server
scp user@server:/path/to/app/data/*.json ./data-backup/
```

## Restore Production Data

To restore backed-up data to the server:

```bash
scp ./data-backup/*.json user@server:/path/to/app/data/
```

## What Gets Deployed

✅ **Deployed (overwritten):**
- All code files (`.ts`, `.tsx`, `.js`)
- Configuration files
- Static assets (except `/public/posts/`)
- Dependencies (`package.json`)

❌ **Not Deployed (preserved):**
- `/data/` directory and all JSON files
- `/public/posts/` (uploaded media)
- `.env` (environment variables)
- `node_modules/`
- `.next/` (build cache)

## Note

If you need to reset data on the server, you must manually SSH in and delete/edit the files in `/data/`.
