// Reset the glob.js to remove debug patches
const fs = require('fs');
const path = require('path');
const globPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'compiled', 'glob', 'glob.js');
let src = fs.readFileSync(globPath, 'utf8');

// Remove our debug stack trace
src = src.replace(';console.error("GLOB STACK TRACE:", new Error().stack)', '');

// Remove previous EPERM-only patch (restore to original state before next.config.ts applies its own patch)
src = src.replace('case"EPERM":case"ENOENT"', 'case"ENOENT"');

fs.writeFileSync(globPath, src, 'utf8');
console.log('Reset glob.js to original state');
