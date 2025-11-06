import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import BrutalistSpinner from '../BrutalistSpinner';

type NotesGateRender = (ctx: ReturnType<typeof useNotes>) => React.ReactNode;

const NotesGate: React.FC<{
  accessToken: string | null;
  children: NotesGateRender;
}> = ({ accessToken, children }) => {
  const ctx = useNotes(accessToken);
  if (ctx.isLoading)
    return (
      <div className='p-6'>
        <BrutalistSpinner />
      </div>
    );
  if (ctx.error)
    return <div className='p-6 text-red-600'>Failed to load notes</div>;
  return <>{children(ctx)}</>;
};

export default NotesGate;
