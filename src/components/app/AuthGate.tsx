import React, { Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ErrorBoundary from '../ErrorBoundary';
import ModalErrorFallback from '../ModalErrorFallback';
import BrutalistSpinner from '../BrutalistSpinner';

const LoginScreen = React.lazy(() => import('../../components/LoginScreen'));

const LoadingScreen: React.FC = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-off-white dark:bg-off-black' aria-live='polite' role='status'>
      <div className='flex flex-col items-center justify-center gap-4'>
        <BrutalistSpinner />
        <p className='font-mono uppercase text-sm tracking-wider text-accent-black dark:text-off-white'>
          LOADING...
        </p>
      </div>
    </div>
  );
};

const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading, login, error } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user)
    return (
      <Suspense fallback={<LoadingScreen />}>
        <ErrorBoundary fallback={<ModalErrorFallback />}>
          <LoginScreen onLogin={login} error={error} />
        </ErrorBoundary>
      </Suspense>
    );
  return <>{children}</>;
};

export default AuthGate;
