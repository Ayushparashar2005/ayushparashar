const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    } else {
      if (file.endsWith('.astro') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, '../src'));

const replacements = [
  { from: /hw-accent-cyan/g, to: 'hw-accent-blue' },
  { from: /border-cyan-500\/50/g, to: 'border-hw-accent-blue/50' },
  { from: /bg-cyan-500\/20/g, to: 'bg-hw-accent-blue/20' },
  { from: /bg-cyan-500\/30/g, to: 'bg-hw-accent-blue/30' },
  { from: /bg-cyan-500/g, to: 'bg-hw-accent-blue' },
  { from: /text-cyan-400/g, to: 'text-hw-accent-blue' },
  { from: /bg-cyan-400/g, to: 'bg-hw-accent-blue' },
  { from: /rgba\(34,211,238,0.6\)/g, to: 'rgba(0,91,196,0.6)' }
];

let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    totalChanges++;
  }
}

console.log(`Total files updated: ${totalChanges}`);
