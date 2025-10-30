#!/usr/bin/env node
/**
 * Migration script to convert old posts.json format to new individual JSON files
 * Run this once if you have existing posts in posts.json on your server
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const postsJsonPath = join(publicDir, 'posts.json');
const postsDir = join(publicDir, 'posts');

async function migrate() {
  console.log('🔄 Migrating posts from posts.json to individual files...');
  
  let posts = [];
  try {
    const content = await readFile(postsJsonPath, 'utf8');
    posts = JSON.parse(content);
  } catch (e) {
    console.log('❌ No posts.json found or invalid JSON');
    return;
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    console.log('✅ No posts to migrate');
    return;
  }

  console.log(`📦 Found ${posts.length} posts to migrate`);

  let migrated = 0;
  for (const post of posts) {
    try {
      // Extract filename from src (remove /posts/ prefix and any query params)
      const filename = post.src.replace('/posts/', '').split('?')[0];
      
      const metadata = {
        id: post.id,
        filename: filename,
        type: post.type,
        alt: post.alt,
        createdAt: post.createdAt || new Date().toISOString()
      };

      const metadataPath = join(postsDir, `${post.id}.json`);
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`  ✓ Migrated: ${post.id} (${filename})`);
      migrated++;
    } catch (e) {
      console.error(`  ✗ Failed to migrate ${post.id}:`, e.message);
    }
  }

  console.log(`\n✅ Migration complete! Migrated ${migrated}/${posts.length} posts`);
  console.log('\n⚠️  After verifying everything works, you can:');
  console.log('   1. Delete or archive the old posts.json file');
  console.log('   2. Commit your code changes');
  console.log('   3. Deploy - your posts will persist on the server!\n');
}

migrate().catch(console.error);
