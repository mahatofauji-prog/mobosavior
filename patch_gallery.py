import re

with open('src/pages/Gallery.tsx', 'r') as f:
    content = f.read()

# Import
content = content.replace(
    "import { GalleryItem } from '../types';",
    "import { GalleryItem, GALLERY_CATEGORIES, mapCategoryToId } from '../types';"
)

content = re.sub(
    r"const MANDATORY_CATEGORIES = \[\s*'All',\s*'Repairing Photos',\s*'Before / After',\s*'Motherboard Work',\s*'Display Replacement',\s*'Customer Delivery Photos',\s*'Repairing Videos'\s*\];",
    "",
    content
)

# Update selectedCategory initialization
# KEEP 'All' as the default for selectedCategory because the tab 'All' represents 'All'.
# Actually 'All' is fine, since GALLERY_CATEGORIES doesn't contain 'All' and we map over it plus 'All' explicitly.
# Wait, let's just make the tab logic explicit.
tab_rendering_pattern = r"""        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
          \{MANDATORY_CATEGORIES\.map\(\(cat\) => \(
            <button
              key=\{cat\}
              onClick=\{\(\) => setSelectedCategory\(cat\)\}
              className=\{\`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all focus:outline-none \$\{
                selectedCategory === cat
                  \? 'bg-white text-\[\#0284C7\] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              \}\`\}
            >
              \{cat\}
            </button>
          \)\)\}
        </div>"""

tab_rendering_replacement = """        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all focus:outline-none ${
              selectedCategory === 'All'
                ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all focus:outline-none ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>"""

content = re.sub(tab_rendering_pattern, tab_rendering_replacement, content)

# Filter logic
filter_logic_pattern = r"""    const matchesCategory =
      selectedCategory === 'All' \|\|
      item\.category\.toLowerCase\(\)\.trim\(\) === selectedCategory\.toLowerCase\(\)\.trim\(\) \|\|
      \(selectedCategory === 'Repairing Videos' && item\.mediaType === 'video'\) \|\|
      \(selectedCategory === 'Before / After' && \(item\.mediaType === 'before_after' \|\| \(item\.beforeImageUrl && item\.afterImageUrl\)\)\);"""

filter_logic_replacement = """    const matchesCategory =
      selectedCategory === 'All' ||
      mapCategoryToId(item.category) === selectedCategory;"""

content = re.sub(filter_logic_pattern, filter_logic_replacement, content)

with open('src/pages/Gallery.tsx', 'w') as f:
    f.write(content)

