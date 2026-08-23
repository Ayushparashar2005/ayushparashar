const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/islands/patch-bay');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /hw-module-header/g, to: 'pb-module-header' },
  { from: /hw-module/g, to: 'pb-module' },
  { from: /hw-label/g, to: 'pb-label' },
  { from: /hw-button/g, to: 'pb-button' },
  { from: /hw-screen-button/g, to: 'pb-button' },
  { from: /text-hw-text-main/g, to: 'text-zinc-300' },
  { from: /text-hw-text-muted/g, to: 'text-zinc-500' },
  { from: /text-hw-accent-cyan/g, to: 'text-cyan-500' },
  { from: /text-hw-accent-orange/g, to: 'text-amber-500' },
  { from: /accent-hw-accent-orange/g, to: 'accent-amber-500' },
  { from: /bg-hw-bg/g, to: 'bg-zinc-950' },
  { from: /border-hw-border-screen/g, to: 'border-zinc-800' },
  { from: /border-hw-border/g, to: 'border-zinc-800' },
  { from: /bg-white/g, to: 'bg-zinc-900' },
  { from: /border-\[#ccc\]/g, to: 'border-zinc-800' },
  { from: /bg-\[#1a1a24\]/g, to: 'bg-zinc-900' },
  { from: /text-\[#888\]/g, to: 'text-zinc-400' },
  { from: /text-\[#eee\]/g, to: 'text-zinc-200' },
  { from: /bg-\[#f0f0f0\]/g, to: 'bg-zinc-900' }
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
