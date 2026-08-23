const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/islands/patch-bay');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /pb-module-header/g, to: 'hw-module-header' },
  { from: /pb-module/g, to: 'hw-module' },
  { from: /pb-label/g, to: 'hw-label' },
  { from: /pb-button/g, to: 'hw-button' },
  { from: /text-zinc-300/g, to: 'text-hw-text-main' },
  { from: /text-zinc-500/g, to: 'text-hw-text-muted' },
  { from: /text-cyan-500/g, to: 'text-hw-accent-cyan' },
  { from: /text-amber-500/g, to: 'text-hw-accent-orange' },
  { from: /accent-amber-500/g, to: 'accent-hw-accent-orange' },
  { from: /bg-zinc-950/g, to: 'bg-hw-bg' },
  { from: /bg-zinc-900/g, to: 'bg-white' },
  { from: /border-zinc-800/g, to: 'border-hw-border' },
  { from: /text-zinc-400/g, to: 'text-[#888]' },
  { from: /text-zinc-200/g, to: 'text-[#eee]' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Reverted ${file}`);
}
