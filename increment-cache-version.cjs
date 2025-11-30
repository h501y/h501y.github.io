// Script to automatically increment cache version in service worker
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'public', 'sw.js');

try {
  // Read service worker file
  let content = fs.readFileSync(swPath, 'utf8');

  // Find current version
  const versionMatch = content.match(/const CACHE_VERSION = (\d+);/);

  if (versionMatch) {
    const currentVersion = parseInt(versionMatch[1]);
    const newVersion = currentVersion + 1;

    // Replace version number
    content = content.replace(
      /const CACHE_VERSION = \d+;/,
      `const CACHE_VERSION = ${newVersion};`
    );

    // Write back to file
    fs.writeFileSync(swPath, content, 'utf8');

    console.log(`✅ Cache version incremented: v${currentVersion} → v${newVersion}`);
  } else {
    console.error('❌ Could not find CACHE_VERSION in service worker');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error incrementing cache version:', error.message);
  process.exit(1);
}
