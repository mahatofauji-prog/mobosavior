import { WebsiteSection } from '../types';
import { DEFAULT_WEBSITE_SECTIONS } from '../data/defaultSections';

/**
 * Checks if a specific section on a page is visible.
 * Defaults to true if no override is set in DB.
 */
export function isSectionVisible(
  sections: WebsiteSection[] | undefined | null,
  page: string,
  sectionKey: string
): boolean {
  if (!sections || sections.length === 0) {
    const defaultSec = DEFAULT_WEBSITE_SECTIONS.find(
      s => s.page === page && s.sectionKey === sectionKey
    );
    return defaultSec ? defaultSec.isVisible : true;
  }

  const sec = sections.find(
    s => s.page === page && s.sectionKey === sectionKey
  );

  if (!sec) {
    const defaultSec = DEFAULT_WEBSITE_SECTIONS.find(
      s => s.page === page && s.sectionKey === sectionKey
    );
    return defaultSec ? defaultSec.isVisible : true;
  }

  return sec.isVisible !== false;
}

/**
 * Returns complete list of WebsiteSections for a given page, merged with defaults
 * and sorted by displayOrder.
 */
export function getSortedSectionsForPage(
  sections: WebsiteSection[] | undefined | null,
  page: string
): WebsiteSection[] {
  const defaultsForPage = DEFAULT_WEBSITE_SECTIONS.filter(s => s.page === page);
  const userSectionsForPage = sections ? sections.filter(s => s.page === page) : [];

  const mergedMap = new Map<string, WebsiteSection>();

  // First populate defaults
  for (const def of defaultsForPage) {
    mergedMap.set(def.sectionKey, { ...def });
  }

  // Override with user DB settings
  for (const userSec of userSectionsForPage) {
    const existing = mergedMap.get(userSec.sectionKey);
    mergedMap.set(userSec.sectionKey, {
      ...existing,
      ...userSec,
      // preserve sectionName & description if missing
      sectionName: userSec.sectionName || existing?.sectionName || userSec.sectionKey,
      description: userSec.description || existing?.description || ''
    });
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );
}

/**
 * Returns complete list of all website sections merged with defaults.
 */
export function getAllSectionsMerged(
  userSections: WebsiteSection[] | undefined | null
): WebsiteSection[] {
  const mergedMap = new Map<string, WebsiteSection>();

  // 1. Fill defaults
  for (const def of DEFAULT_WEBSITE_SECTIONS) {
    mergedMap.set(def.id, { ...def });
  }

  // 2. Override with DB records
  if (userSections && userSections.length > 0) {
    for (const dbSec of userSections) {
      const existing = mergedMap.get(dbSec.id) || mergedMap.get(`${dbSec.page}.${dbSec.sectionKey}`);
      if (existing) {
        mergedMap.set(existing.id, {
          ...existing,
          ...dbSec,
          sectionName: dbSec.sectionName || existing.sectionName,
          description: dbSec.description || existing.description
        });
      } else {
        mergedMap.set(dbSec.id, { ...dbSec });
      }
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) => {
    if (a.page === b.page) {
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    }
    return a.page.localeCompare(b.page);
  });
}
