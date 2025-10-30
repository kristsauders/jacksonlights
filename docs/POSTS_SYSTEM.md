# Posts System

## Overview

Posts (photos and videos) are now stored as individual files in `/public/posts/` with accompanying JSON metadata files. This ensures posts persist across deployments.

## File Structure

Each post consists of two files:
- **Media file**: `{id}.{ext}` (e.g., `m1abc23.jpg`, `m1def45.mp4`)
- **Metadata file**: `{id}.json` (e.g., `m1abc23.json`)

Example metadata file (`m1abc23.json`):
```json
{
  "id": "m1abc23",
  "filename": "m1abc23.jpg",
  "type": "image",
  "alt": "Beautiful holiday display",
  "createdAt": "2025-10-30T12:34:56.789Z"
}
```

## How It Works

### Upload
1. Admin uploads a file via the Admin Dashboard
2. System generates a unique ID
3. Media file is saved as `{id}.{ext}`
4. Metadata is saved as `{id}.json`
5. Posts feed auto-refreshes

### Display
1. `/api/posts` endpoint scans the `/public/posts/` directory
2. Finds all `.json` metadata files
3. Verifies corresponding media files exist
4. Returns sorted list (newest first) with `/api/posts/media/{filename}` URLs
5. Frontend displays posts from API
6. Media is served through `/api/posts/media/[filename]` endpoint (solves Next.js static file caching)

### Media Serving
Media files are served through a custom API route (`/api/posts/media/[filename]`) instead of directly from `/public/posts/`. This ensures:
- ✅ Files uploaded after build are immediately accessible
- ✅ No need to rebuild/restart after uploads
- ✅ Proper caching headers for performance
- ✅ Security checks against directory traversal

### Delete
1. Admin clicks delete on a post
2. Both media file and metadata JSON are removed
3. Posts feed auto-refreshes

## Why This Approach?

✅ **Persists across deployments** - Files live only on server, not in git  
✅ **No overwrites** - Local empty `posts.json` won't delete server posts  
✅ **Scalable** - Each post is independent  
✅ **Easy to manage** - Can manually add/remove files if needed  
✅ **No cache issues** - Fresh media loads immediately after upload

## Migration

If you have existing posts in `posts.json` on your server, run:

```bash
node scripts/migrate-posts.mjs
```

This will convert each entry to individual JSON files.

## Deployment

The `/public/posts/` directory is in `.gitignore`, so:
1. Make code changes locally
2. Commit and push (posts directory is excluded)
3. Deploy - server posts remain untouched ✨

## Manual Operations

### Add a post manually
1. Copy media file to `/public/posts/` with a unique name (e.g., `abc123.jpg`)
2. Create `abc123.json`:
```json
{
  "id": "abc123",
  "filename": "abc123.jpg",
  "type": "image",
  "alt": "My caption",
  "createdAt": "2025-10-30T00:00:00.000Z"
}
```

### Backup posts
Copy the entire `/public/posts/` directory

### Restore posts
Copy files back to `/public/posts/` on the server
