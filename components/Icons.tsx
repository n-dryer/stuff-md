import React from 'react';

export const createIcon = (path: React.ReactNode) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    {path}
  </svg>
);

export const categoryIcons = {
  ALL: createIcon(
    <>
      <rect x='3' y='3' width='7' height='7'></rect>
      <rect x='14' y='3' width='7' height='7'></rect>
      <rect x='14' y='14' width='7' height='7'></rect>
      <rect x='3' y='14' width='7' height='7'></rect>
    </>
  ),
  IDEAS: createIcon(
    <>
      <path d='M12 2a7 7 0 0 0-7 7c0 3.03 1.53 5.58 3.72 6.75L8 18h8l-.72-2.25A6.96 6.96 0 0 0 19 9a7 7 0 0 0-7-7z'></path>
      <path d='M12 20h0'></path>
    </>
  ),
  LINKS: createIcon(
    <>
      <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72'></path>
      <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72'></path>
    </>
  ),
  'PERSONAL / SHOPPING': createIcon(
    <>
      <path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'></path>
      <line x1='3' y1='6' x2='21' y2='6'></line>
      <path d='M16 10a4 4 0 0 1-8 0'></path>
    </>
  ),
  PROGRAMMING: createIcon(
    <>
      <polyline points='16 18 22 12 16 6'></polyline>
      <polyline points='8 6 2 12 8 18'></polyline>
    </>
  ),
  DEFAULT: createIcon(
    <path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'></path>
  ),
};

export const IconToggleLeft = createIcon(
  <polyline points='15 18 9 12 15 6'></polyline>
);
export const IconToggleRight = createIcon(
  <polyline points='9 18 15 12 9 6'></polyline>
);
export const IconSun = createIcon(
  <>
    <circle cx='12' cy='12' r='5'></circle>
    <line x1='12' y1='1' x2='12' y2='3'></line>
    <line x1='12' y1='21' x2='12' y2='23'></line>
    <line x1='4.22' y1='4.22' x2='5.64' y2='5.64'></line>
    <line x1='18.36' y1='18.36' x2='19.78' y2='19.78'></line>
    <line x1='1' y1='12' x2='3' y2='12'></line>
    <line x1='21' y1='12' x2='23' y2='12'></line>
    <line x1='4.22' y1='19.78' x2='5.64' y2='18.36'></line>
    <line x1='18.36' y1='5.64' x2='19.78' y2='4.22'></line>
  </>
);
export const IconMoon = createIcon(
  <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path>
);
export const IconChevronRight = createIcon(
  <polyline points='9 6 15 12 9 18'></polyline>
);
export const IconChevronLeft = createIcon(
  <polyline points='15 6 9 12 15 18'></polyline>
);
export const IconSidebarExpand = IconChevronRight;
export const IconSidebarCollapse = IconChevronLeft;
// Minimal single-stroke caret optimized for UI affordances (slightly lighter stroke)
export const IconCaret = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 6l6 6-6 6'></path>
  </svg>
);
export const IconLogout = createIcon(
  <>
    <path d='M8 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h2'></path>
    <polyline points='13 6 18 12 13 18'></polyline>
    <line x1='18' y1='12' x2='6' y2='12'></line>
  </>
);

export const IconLogoutBrutalist = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='28'
    height='28'
    viewBox='0 0 28 28'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='square'
    strokeLinejoin='miter'
  >
    <rect x='3' y='6' width='10' height='16'></rect>
    <path d='M13 14h11'></path>
    <path d='M18 9l6 5-6 5'></path>
  </svg>
);
export const IconSearch = createIcon(
  <>
    <circle cx='11' cy='11' r='8'></circle>
    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
  </>
);

export const IconGrid = createIcon(
  <>
    <rect x='3' y='3' width='7' height='7'></rect>
    <rect x='14' y='3' width='7' height='7'></rect>
    <rect x='14' y='14' width='7' height='7'></rect>
    <rect x='3' y='14' width='7' height='7'></rect>
  </>
);

export const IconList = createIcon(
  <>
    <line x1='8' y1='6' x2='21' y2='6'></line>
    <line x1='8' y1='12' x2='21' y2='12'></line>
    <line x1='8' y1='18' x2='21' y2='18'></line>
    <line x1='3' y1='6' x2='3.01' y2='6'></line>
    <line x1='3' y1='12' x2='3.01' y2='12'></line>
    <line x1='3' y1='18' x2='3.01' y2='18'></line>
  </>
);
