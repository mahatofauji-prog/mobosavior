#!/bin/bash
cat << 'INNER_EOF' >> src/types.ts

export const GALLERY_CATEGORIES = [
  { id: 'repairing', label: 'Repairing Photos' },
  { id: 'before_after', label: 'Before / After' },
  { id: 'motherboard', label: 'Motherboard Work' },
  { id: 'display', label: 'Display Replacement' },
  { id: 'customer_delivery', label: 'Customer Delivery Photos' },
  { id: 'repairing_videos', label: 'Repairing Videos' }
];

export const mapCategoryToId = (cat: string) => {
  const normalized = cat.toLowerCase().trim();
  switch (normalized) {
    case 'repairing photos': return 'repairing';
    case 'before / after': return 'before_after';
    case 'motherboard work': return 'motherboard';
    case 'display replacement': return 'display';
    case 'customer delivery photos': return 'customer_delivery';
    case 'repairing videos': return 'repairing_videos';
    default: return cat;
  }
};
INNER_EOF
