import React from 'react';
import { IconSparkles as TablerIconSparkles } from '@tabler/icons-react';

interface AIIconProps {
  className?: string;
  'aria-label'?: string;
}

const AIIcon: React.FC<AIIconProps> = ({ className, 'aria-label': ariaLabel }) => {
  return (
    <TablerIconSparkles
      className={className}
      aria-label={ariaLabel}
      size={20}
      strokeWidth={2}
    />
  );
};

export default AIIcon;

