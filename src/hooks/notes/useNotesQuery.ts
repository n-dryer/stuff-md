import { useState, useEffect, useCallback } from 'react';
import { Note } from '../../types';
import { googleDriveService } from '../../services/googleDriveService';

export function useNotesQuery(accessToken: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await googleDriveService.getAllNotes(accessToken);
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, setNotes, isLoading, error, refetch: fetchNotes };
}
