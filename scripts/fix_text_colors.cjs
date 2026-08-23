const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/islands/patch-bay');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /text-\[#eee\]/g, to: 'text-hw-text-main' },
  { from: /text-\[#888\]/g, to: 'text-hw-text-muted' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
