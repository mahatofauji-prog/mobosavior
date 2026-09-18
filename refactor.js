import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace firestore imports
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]firebase\/firestore['"];?/g, (match, p1) => {
      // Calculate relative path to src/lib/supabase
      let depth = filePath.split(path.sep).length - 2;
      let relPath = depth === 0 ? './lib/supabase' : '../'.repeat(depth) + 'lib/supabase';
      return `import { ${p1.trim()} } from '${relPath}';`;
    });
    
    // Replace config imports
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"](?:\.\.\/)+firebase\/config['"];?/g, (match, p1) => {
      let depth = filePath.split(path.sep).length - 2;
      let relPath = depth === 0 ? './lib/supabase' : '../'.repeat(depth) + 'lib/supabase';
      return `import { ${p1.trim()} } from '${relPath}';`;
    });
    
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]\.\/firebase\/config['"];?/g, (match, p1) => {
      return `import { ${p1.trim()} } from './lib/supabase';`;
    });

    // Replace seed imports
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"](?:\.\.\/)+firebase\/seed['"];?/g, (match, p1) => {
      let depth = filePath.split(path.sep).length - 2;
      let relPath = depth === 0 ? './lib/seed' : '../'.repeat(depth) + 'lib/seed';
      return `import { ${p1.trim()} } from '${relPath}';`;
    });
    
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]\.\/firebase\/seed['"];?/g, (match, p1) => {
      return `import { ${p1.trim()} } from './lib/seed';`;
    });
    
    // Replace firebase/auth
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]firebase\/auth['"];?/g, (match, p1) => {
      let depth = filePath.split(path.sep).length - 2;
      let relPath = depth === 0 ? './lib/supabase' : '../'.repeat(depth) + 'lib/supabase';
      return `import { ${p1.trim()} } from '${relPath}';`;
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
