const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) results = results.concat(walk(fullPath));
    else if (file === 'page.tsx') results.push(fullPath);
  }
  return results;
}

const pages = walk(path.join(__dirname, '..', 'app'));
console.log('Total pages:', pages.length);

const summary = [];
for (const p of pages) {
  const content = fs.readFileSync(p, 'utf8');
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
  const states = (content.match(/useState/g) || []).length;
  const effects = (content.match(/useEffect/g) || []).length;
  const funcs = (content.match(/(?:const|let|async function|function)\s+(handle\w+|fetch\w+|load\w+|on\w+|toggle\w+|submit\w+|delete\w+|calculate\w+|format\w+)/g) || []).length;
  const hookCalls = (content.match(/\buse[A-Z]\w*\(/g) || []);
  const rel = path.relative(path.join(__dirname, '..', 'app'), p).replace(/\\/g, '/');
  summary.push({
    rel,
    hasUseClient,
    states,
    effects,
    funcs,
    hookCalls: [...new Set(hookCalls)]
  });
}

console.log(JSON.stringify(summary, null, 2));
