#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(process.cwd(), 'apps/web/dist/assets/js'),
  path.resolve(process.cwd(), 'dist/assets/js'),
];
const webDistDir = candidates.find((p) => fs.existsSync(p));
const maxEntryKb = Number(process.env.WEB_BUNDLE_ENTRY_KB || 350);
const maxChunkKb = Number(process.env.WEB_BUNDLE_CHUNK_KB || 650);

function kb(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

if (!webDistDir) {
  console.error('Bundle check failed: build output not found at dist/assets/js');
  process.exit(1);
}

const files = fs
  .readdirSync(webDistDir)
  .filter((file) => file.endsWith('.js'))
  .map((file) => {
    const fullPath = path.join(webDistDir, file);
    const stat = fs.statSync(fullPath);
    return { file, sizeKb: kb(stat.size) };
  });

const entryFiles = files.filter((f) => f.file.startsWith('index-'));
const oversizedEntry = entryFiles.find((f) => f.sizeKb > maxEntryKb);
const oversizedChunk = files.find((f) => !f.file.startsWith('index-') && f.sizeKb > maxChunkKb);

if (oversizedEntry || oversizedChunk) {
  if (oversizedEntry) {
    console.error(
      `Bundle check failed: entry ${oversizedEntry.file} is ${oversizedEntry.sizeKb}KB (limit ${maxEntryKb}KB)`,
    );
  }
  if (oversizedChunk) {
    console.error(
      `Bundle check failed: chunk ${oversizedChunk.file} is ${oversizedChunk.sizeKb}KB (limit ${maxChunkKb}KB)`,
    );
  }
  process.exit(1);
}

console.log(
  `Bundle check passed. Entry limit: ${maxEntryKb}KB, chunk limit: ${maxChunkKb}KB, files checked: ${files.length}`,
);
