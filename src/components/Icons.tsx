import React from 'react';
import {
  IconAperture as TablerIconAperture,
  IconArchive as TablerIconArchive,
  IconArrowLeft as TablerIconArrowLeft,
  IconArrowRight as TablerIconArrowRight,
  IconBulb as TablerIconBulb,
  IconLink as TablerIconLink,
  IconCode as TablerIconCode,
  IconShoppingCart as TablerIconShoppingCart,
  IconChevronDown as TablerIconChevronDown,
  IconSearch as TablerIconSearch,
  IconInfoCircle as TablerIconInfo,
  IconChevronLeft as TablerIconCaret,
} from '@tabler/icons-react';

export const createIcon = (icon: React.ReactNode) => icon;

export const IconAperture = createIcon(
  <TablerIconAperture size={20} strokeWidth={2} />
);
export const IconArchive = createIcon(
  <TablerIconArchive size={20} strokeWidth={2} />
);
export const IconArrowLeft = createIcon(
  <TablerIconArrowLeft size={20} strokeWidth={2} />
);
export const IconArrowRight = createIcon(
  <TablerIconArrowRight size={20} strokeWidth={2} />
);
export const IconBulb = createIcon(
  <TablerIconBulb size={20} strokeWidth={2} />
);
export const IconLink = createIcon(
  <TablerIconLink size={20} strokeWidth={2} />
);
export const IconCode = createIcon(
  <TablerIconCode size={20} strokeWidth={2} />
);
export const IconShoppingCart = createIcon(
  <TablerIconShoppingCart size={20} strokeWidth={2} />
);
export const IconChevronDown = createIcon(
  <TablerIconChevronDown strokeWidth={2.5} />
);
export const IconSearch = createIcon(
  <TablerIconSearch size={20} strokeWidth={2} />
);
export const IconInfo = createIcon(
  <TablerIconInfo size={20} strokeWidth={2} />
);
export const IconCaret = createIcon(
  <TablerIconCaret size={20} strokeWidth={2} />
);

export const categoryIcons = {
  DEFAULT: <TablerIconArchive size={20} strokeWidth={2} />,
  IDEAS: <TablerIconBulb size={20} strokeWidth={2} />,
  LINKS: <TablerIconLink size={20} strokeWidth={2} />,
  PROGRAMMING: <TablerIconCode size={20} strokeWidth={2} />,
  'PERSONAL / SHOPPING': <TablerIconShoppingCart size={20} strokeWidth={2} />,
};
