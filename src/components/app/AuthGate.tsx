import React, { Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ErrorBoundary from '../ErrorBoundary';
import ModalErrorFallback from '../ModalErrorFallback';

const LoginScreen = React.lazy(() => import('../../components/LoginScreen'));

const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading, login, error } = useAuth();

  if (isLoading) return <div className='p-6'>Loading…</div>;
  if (!user)
    return (
      <Suspense fallback={<div className='p-6'>Loading…</div>}>
        <ErrorBoundary fallback={<ModalErrorFallback />}>
          <LoginScreen onLogin={login} error={error} />
        </ErrorBoundary>
      </Suspense>
    );
  return <>{children}</>;
};

export default AuthGate;
