import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir);

const commonJsImports = [
  'require\\(',
  'const\\s+[a-zA-Z0-9_]+\\s*=\\s*require\\(',
  'module\\.exports'
];

const esmImports = [
  'import',
  'import',
  'export default'
];

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace CommonJS requires with ES imports
    for (let i = 0; i < commonJsImports.length; i++) {
      const regex = new RegExp(commonJsImports[i], 'g');
      content = content.replace(regex, esmImports[i]);
    }
    
    // Add .js extension to local imports
    content = content.replace(/\.\/([^'"\s]+)(?<!\.js)(['"])/g, './$1.js$2');
    
    fs.writeFileSync(filePath, content);
    console.log(`Converted ${file} to ES modules`);
  }
});

console.log('All route files have been converted to ES modules.');
