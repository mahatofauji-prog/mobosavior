import re

with open('src/components/admin/AdminGalleryManager.tsx', 'r') as f:
    content = f.read()

# Replace CATEGORIES and add GALLERY_CATEGORIES import
content = content.replace(
    "import { GalleryItem, Service } from '../../types';",
    "import { GalleryItem, Service, GALLERY_CATEGORIES, mapCategoryToId } from '../../types';"
)

content = re.sub(
    r"const CATEGORIES = \[\s*'Repairing Photos',\s*'Before / After',\s*'Motherboard Work',\s*'Display Replacement',\s*'Customer Delivery Photos',\s*'Repairing Videos'\s*\];",
    "",
    content
)

# Replace 'All' with 'all' state for consistency? No, keep 'All'.
content = content.replace("const [category, setCategory] = useState<string>('Repairing Photos');", "const [category, setCategory] = useState<string>('repairing');")
content = content.replace("setCategory('Repairing Photos');", "setCategory('repairing');")
content = content.replace("setCategory(item.category || 'Repairing Photos');", "setCategory(mapCategoryToId(item.category || 'repairing'));")


# In filteredGallery:
filtered_gallery_pattern = r"""  const filteredGallery = gallery\.filter\(\(item\) => \{
    if \(activeTabCategory === 'All'\) return true;
    return item\.category === activeTabCategory;
  \}\);"""

filtered_gallery_replacement = """  const filteredGallery = gallery.filter((item) => {
    if (activeTabCategory === 'All') return true;
    return mapCategoryToId(item.category) === activeTabCategory;
  });"""
content = content.replace(
    "  const filteredGallery = gallery.filter((item) => {\n    if (activeTabCategory === 'All') return true;\n    return item.category === activeTabCategory;\n  });",
    filtered_gallery_replacement
)

# Tab rendering
tab_rendering_pattern = r"""        \{CATEGORIES\.map\(\(cat\) => \(
          <button
            key=\{cat\}
            onClick=\{\(\) => setActiveTabCategory\(cat\)\}
            className=\{\`px-3\.5 py-1\.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap \$\{
              activeTabCategory === cat
                \? 'bg-\[\#0284C7\] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            \}\`\}
          >
            \{cat\} \(\{gallery\.filter\(\(g\) => g\.category === cat\)\.length\}\)
          </button>
        \)\)\}"""

tab_rendering_replacement = """        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTabCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTabCategory === cat.id
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label} ({gallery.filter((g) => mapCategoryToId(g.category) === cat.id).length})
          </button>
        ))}"""
content = re.sub(tab_rendering_pattern, tab_rendering_replacement, content)

# Form Select rendering
select_rendering_pattern = r"""                <select
                  value=\{category\}
                  onChange=\{\(e\) => setCategory\(e\.target\.value\)\}
                  className="w-full px-3\.5 py-2\.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  \{CATEGORIES\.map\(\(cat\) => \(
                    <option key=\{cat\} value=\{cat\}>
                      \{cat\}
                    </option>
                  \)\)\}
                </select>"""

select_rendering_replacement = """                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  {GALLERY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>"""
content = re.sub(select_rendering_pattern, select_rendering_replacement, content)

# Payload category default
payload_pattern = r"category: category \|\| \(mediaType === 'video' \? 'Repairing Videos' : 'Repairing Photos'\),"
payload_replacement = "category: category || (mediaType === 'video' ? 'repairing_videos' : 'repairing'),"
content = re.sub(payload_pattern, payload_replacement, content)

with open('src/components/admin/AdminGalleryManager.tsx', 'w') as f:
    f.write(content)
