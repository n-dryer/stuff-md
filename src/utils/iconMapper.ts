import React from 'react';
import {
  IconArchive,
  IconBulb,
  IconLink,
  IconCode,
  IconShoppingCart,
} from '../components/Icons';

/**
 * Maps an icon name string to its corresponding React component
 */
export const mapIconToComponent = (iconName: string): React.ReactNode => {
  const normalized = iconName.toLowerCase().trim();

  switch (normalized) {
    case 'lightbulb':
      return IconBulb;
    case 'link':
      return IconLink;
    case 'code':
      return IconCode;
    case 'shopping-cart':
      return IconShoppingCart;
    case 'default':
    default:
      return IconArchive;
  }
};
