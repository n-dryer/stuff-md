import React from 'react';
import { categoryIcons } from '../components/Icons';

/**
 * Icon name suggestions from AI mapped to available icon components
 */
export type IconName = 
  | 'lightbulb' 
  | 'link' 
  | 'code' 
  | 'shopping-cart' 
  | 'book' 
  | 'file' 
  | 'folder' 
  | 'star' 
  | 'calendar' 
  | 'tag'
  | 'ideas'
  | 'programming'
  | 'shopping'
  | 'default';

/**
 * Maps AI-suggested icon names to available icon components
 * @param iconName The icon name suggested by AI (case-insensitive)
 * @returns The corresponding icon component or DEFAULT if not found
 */
export const mapIconNameToComponent = (iconName: string): React.ReactNode => {
  if (!iconName || typeof iconName !== 'string') {
    return categoryIcons.DEFAULT;
  }

  // Normalize icon name: lowercase, trim, handle variations
  const normalized = iconName.toLowerCase().trim().replace(/\s+/g, '-');

  // Direct mappings
  const iconMap: Record<string, React.ReactNode> = {
    'lightbulb': categoryIcons.IDEAS,
    'bulb': categoryIcons.IDEAS,
    'idea': categoryIcons.IDEAS,
    'ideas': categoryIcons.IDEAS,
    'link': categoryIcons.LINKS,
    'links': categoryIcons.LINKS,
    'url': categoryIcons.LINKS,
    'code': categoryIcons.PROGRAMMING,
    'programming': categoryIcons.PROGRAMMING,
    'program': categoryIcons.PROGRAMMING,
    'development': categoryIcons.PROGRAMMING,
    'dev': categoryIcons.PROGRAMMING,
    'shopping-cart': categoryIcons['PERSONAL / SHOPPING'],
    'shopping': categoryIcons['PERSONAL / SHOPPING'],
    'cart': categoryIcons['PERSONAL / SHOPPING'],
    'store': categoryIcons['PERSONAL / SHOPPING'],
    'personal': categoryIcons['PERSONAL / SHOPPING'],
    'book': categoryIcons.DEFAULT,
    'file': categoryIcons.DEFAULT,
    'folder': categoryIcons.DEFAULT,
    'star': categoryIcons.DEFAULT,
    'calendar': categoryIcons.DEFAULT,
    'tag': categoryIcons.DEFAULT,
    'default': categoryIcons.DEFAULT,
  };

  // Try exact match first
  if (iconMap[normalized]) {
    return iconMap[normalized];
  }

  // Try partial matches
  for (const [key, value] of Object.entries(iconMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Fallback to DEFAULT
  return categoryIcons.DEFAULT;
};

/**
 * Gets icon name from category path (for backward compatibility)
 * @param categoryPath The category path array
 * @returns An icon name based on the category
 */
export const getIconNameFromCategory = (categoryPath: string[]): IconName => {
  if (!categoryPath || categoryPath.length === 0) {
    return 'default';
  }

  const firstCategory = categoryPath[0]?.toLowerCase() || '';
  const fullPath = categoryPath.join(' ').toLowerCase();

  if (firstCategory.includes('idea') || fullPath.includes('idea')) {
    return 'ideas';
  }
  if (firstCategory.includes('link') || fullPath.includes('link')) {
    return 'link';
  }
  if (firstCategory.includes('program') || firstCategory.includes('code') || fullPath.includes('program') || fullPath.includes('code')) {
    return 'programming';
  }
  if (firstCategory.includes('shopping') || firstCategory.includes('personal') || fullPath.includes('shopping') || fullPath.includes('personal')) {
    return 'shopping';
  }

  return 'default';
};

