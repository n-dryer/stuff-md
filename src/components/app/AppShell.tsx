import React, { Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className='p-6'>Loading…</div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppShell;
