const fs = require('fs');
const path = require('path');

function processDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      if (['node_modules', '.git', '.next', 'public', '.vscode'].includes(file)) {
        continue;
      }
      
      if (fs.statSync(fullPath).isDirectory()) {
        processDir(fullPath);
      } else {
        if (!fullPath.match(/\.(ts|tsx|js|jsx|json|md|css|env.*)$/)) {
          continue;
        }
        
        let content = fs.readFileSync(fullPath, 'utf8');
        const original = content;
        
        content = content.replace(/Specular OS/g, 'Specular OS');
        content = content.replace(/Specular OS/g, 'Specular OS');
        content = content.replace(/Specular OS/g, 'Specular OS');
        content = content.replace(/Specular AI/g, 'Specular AI');
        content = content.replace(/Specular AI/g, 'Specular AI');
        
        if (content !== original) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  } catch (err) {
    // Ignore permissions
  }
}

processDir(__dirname);
console.log('All Onyx -> Specular replacements completed!');
