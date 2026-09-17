import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("export const mapCategoryToId = (cat: string) => {\n  const normalized = cat.toLowerCase().trim();", "export const mapCategoryToId = (cat: string) => {\n  if (!cat) return '';\n  const normalized = cat.toLowerCase().trim();")

with open('src/types.ts', 'w') as f:
    f.write(content)
