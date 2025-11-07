import { useState, useEffect, useCallback } from 'react';
import { Note } from '../../types';
import { googleDriveService } from '../../services/googleDriveService';

export function useNotesQuery(accessToken: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await googleDriveService.getAllNotes(accessToken);
      setNotes(fetchedNotes);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to fetch notes:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      refetch();
    } else {
      setNotes([]);
      setError(null);
      setIsLoading(false);
    }
  }, [accessToken, refetch]);

  return { notes, setNotes, isLoading, error, refetch };
}
