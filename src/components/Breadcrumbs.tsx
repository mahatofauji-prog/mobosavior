import React, { useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (route: string) => void;
}

export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  useEffect(() => {
    // Generate BreadcrumbList Schema.org JSON-LD
    const baseUrl = window.location.origin;
    const itemListElement = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${baseUrl}/#/`
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        'item': item.route ? `${baseUrl}/#/${item.route}` : `${baseUrl}/#`
      }))
    ];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': itemListElement
    };

    const existingScript = document.getElementById('breadcrumb-schema');
    if (existingScript) {
      existingScript.innerHTML = JSON.stringify(schema);
    } else {
      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-3 bg-slate-50/80 rounded-xl border border-slate-100/80 mb-6 inline-block max-w-full">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium">
        <li>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex items-center gap-1 hover:text-[#0284C7] transition-colors focus:outline-none"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
              <li>
                {isLast || !item.route ? (
                  <span className="font-bold text-slate-900 truncate max-w-[180px] xs:max-w-[240px] inline-block align-bottom">
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate && onNavigate(item.route!)}
                    className="hover:text-[#0284C7] transition-colors truncate max-w-[140px] xs:max-w-[200px] inline-block align-bottom focus:outline-none"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
