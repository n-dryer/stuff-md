import React from 'react';

const AIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        role="img"
        {...props}
    >
        <path d="M12 3L14.34 9.66L21 12L14.34 14.34L12 21L9.66 14.34L3 12L9.66 9.66L12 3z"/>
    </svg>
);

export default AIIcon;
