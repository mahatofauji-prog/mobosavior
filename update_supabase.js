const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(/export function doc\(db: any, path\?: string, id\?: string\) {[\s\S]*?return { type: 'doc', path: id \? `\$\{path\}\/\$\{id\}` : path };\n}/m, `export function doc(db: any, path?: string, id?: string) {
  if (db && db.type === 'collection' && !path) {
    const newId = crypto.randomUUID();
    return { type: 'doc', path: \`\${db.path}/\${newId}\`, id: newId };
  }
  if (arguments.length === 2 && db && db.type === 'collection') {
    return { type: 'doc', path: \`\${db.path}/\${path}\`, id: path };
  }
  const resolvedId = id || (path && path.split('/').pop()) || crypto.randomUUID();
  return { type: 'doc', path: id ? \`\${path}/\${id}\` : path, id: resolvedId };
}`);

fs.writeFileSync('src/lib/supabase.ts', code);
