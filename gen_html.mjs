import { readFileSync, writeFileSync } from 'fs';

const poems = JSON.parse(readFileSync('/workspace/poem-learning/poems80.json', 'utf8'));

// Known CDN URLs for AI-generated images
const cdnUrls = {
  25: 'https://cdn.hailuoai.com/mcp/image_tool/output/473932182464974854/372569239945651/1775439142_219a64f9.jpg',
  26: 'https://cdn.hailuoai.com/mcp/image_tool/output/473932182464974854/372569239945651/1775439196_c9d8b36d.jpg',
  // more to add as uploaded
};

// Add CDN URLs
poems.forEach(p => {
  p.imgUrl = cdnUrls[p.id] || null;
});

const poemsJson = JSON.stringify(poems);
console.log('Poems with CDN:', poems.filter(p=>p.imgUrl).length);

// Write poems JSON with URLs
writeFileSync('/workspace/poem-learning/poems80.json', JSON.stringify(poems, null, 2), 'utf8');

// Build HTML (simplified - same structure as before but with 80 poems)
// The HTML generator is the same as before, just uses the 80-poem array
// Since we already have a working HTML, let's just update it with the new poems array

// Read current HTML
const html = readFileSync('/workspace/poem-learning/index.html', 'utf8');
// Replace the poems array with the new one
const newHtml = html.replace(
  /const poems = \[.*?\];/s,
  'const poems = ' + poemsJson + ';'
);
// Check size
writeFileSync('/workspace/poem-learning/index_new.html', newHtml, 'utf8');
console.log('New HTML size:', newHtml.length, 'bytes');
