import { useState, useCallback, useEffect, useRef } from 'react';

import { getAICategorization } from '../services/aiService';
import { driveService } from '../services/googleDriveService';
import { findOrCreateAppFolder } from '../services/drive/folderOperations';
import { Note } from '../types';
import { toError } from '../utils/typeGuards';
import {
  validateNoteContent,
  validateCustomInstructions,
} from '../utils/inputValidation';
import { logError } from '../utils/logger';
import { generateTempId, createOptimisticNote } from '../utils/noteHelpers';
import {
  withOptimisticAdd,
  withOptimisticUpdate,
  withOptimisticDelete,
} from '../utils/optimisticUpdates';
import { useAICategorization, processAIResult } from './useAICategorization';

export function useNotes(accessToken: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { applyAICategorization } = useAICategorization();

  const fetchNotes = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedNotes = await driveService.fetchNotes(accessToken, signal);
        if (!signal?.aborted) {
          setNotes(fetchedNotes);
        }
      } catch (err) {
        if (signal?.aborted) return;
        logError('Failed to fetch notes:', err);
        setError(toError(err));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [accessToken]
  );

  useEffect(() => {
    // Cancel any in-flight requests when accessToken changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (accessToken) {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      // Pre-fetch folder ID to have it ready for saves
      // This runs in parallel with fetchNotes to avoid blocking
      findOrCreateAppFolder(accessToken, controller.signal).catch(err => {
        // Log but don't throw - folder will be fetched on first save if this fails
        logError('Failed to pre-fetch folder ID:', err);
      });
      
      fetchNotes(controller.signal);
    } else {
      setNotes([]);
      setIsLoading(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [accessToken, fetchNotes]);

  const saveNote = useCallback(
    async (
      content: string,
      customInstructions: string
    ): Promise<Omit<Note, 'id'>> => {
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      // Validate inputs
      const validatedContent = validateNoteContent(content);
      const validatedInstructions = validateCustomInstructions(
        customInstructions || ''
      );

      setError(null);

      const tempId = generateTempId();
      const tempTitle = validatedContent.slice(0, 100).trim() || 'Untitled';
      const optimisticNote = createOptimisticNote(
        tempId,
        validatedContent,
        tempTitle
      );

      const { applyOptimistic, rollback } = withOptimisticAdd(
        notes,
        optimisticNote,
        setNotes,
        error => {
          setError(error);
        }
      );

      applyOptimistic();

      try {
        const savedNote = await driveService.saveNote(accessToken, {
          name: optimisticNote.name,
          content: validatedContent,
          title: tempTitle,
          summary: 'Processing...',
          date: optimisticNote.date,
          categoryPath: ['Uncategorized'],
          tags: [],
          aiGenerated: null,
        });

        setNotes(prev =>
          prev.map(note => (note.id === tempId ? savedNote : note))
        );

        applyAICategorization(
          accessToken,
          savedNote.id,
          validatedContent,
          validatedInstructions,
          updates => {
            setNotes(prev =>
              prev.map(note =>
                note.id === savedNote.id ? { ...note, ...updates } : note
              )
            );
          }
        ).catch(err => {
          logError('AI categorization failed:', err);
        });

        return {
          name: savedNote.name,
          content: validatedContent,
          title: tempTitle,
          summary: 'Processing...',
          date: savedNote.date,
          categoryPath: ['Uncategorized'],
          tags: [],
          aiGenerated: null,
        };
      } catch (err) {
        rollback(err);
        const error = toError(err);
        throw error;
      }
    },
    [accessToken]
  );

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>): Promise<void> => {
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
      setError(null);

      const { applyOptimistic, rollback } = withOptimisticUpdate(
        notes,
        noteId,
        updates,
        setNotes,
        error => {
          setError(error);
        },
        fetchNotes
      );

      applyOptimistic();

      try {
        await driveService.updateNote(accessToken, noteId, updates);
      } catch (err) {
        await rollback(err);
        const error = toError(err);
        throw error;
      }
    },
    [accessToken, fetchNotes]
  );

  const regenerateNote = useCallback(
    async (
      note: Note,
      newContent: string,
      customInstructions: string
    ): Promise<void> => {
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      // Validate inputs
      const validatedContent = validateNoteContent(newContent);
      const validatedInstructions = validateCustomInstructions(
        customInstructions || ''
      );

      setError(null);
      try {
        const aiResult = await getAICategorization(
          validatedContent,
          validatedInstructions
        );
        if (aiResult) {
          const processedUpdates = processAIResult(aiResult, validatedContent);
          if (processedUpdates) {
            const updates: Partial<Note> = {
              content: validatedContent,
              ...processedUpdates,
            };
            await updateNote(note.id, updates);
          } else {
            await updateNote(note.id, { content: validatedContent });
          }
        } else {
          logError(
            'AI categorization failed during note update. Saving content only.'
          );
          await updateNote(note.id, { content: validatedContent });
        }
      } catch (err) {
        const error = toError(err);
        setError(error);
        throw error;
      }
    },
    [accessToken, updateNote]
  );

  const deleteTagFromNote = useCallback(
    async (noteId: string, tagToDelete: string): Promise<void> => {
      if (!accessToken) return;
      const noteToUpdate = notes.find(note => note.id === noteId);
      if (!noteToUpdate) return;

      const updatedTags = noteToUpdate.tags.filter(tag => tag !== tagToDelete);
      await updateNote(noteId, { tags: updatedTags });
    },
    [accessToken, notes, updateNote]
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
      setError(null);

      const { applyOptimistic, rollback } = withOptimisticDelete(
        notes,
        [noteId],
        setNotes,
        error => {
          setError(error);
        }
      );

      const deletedNotes = applyOptimistic();

      try {
        await driveService.deleteNote(accessToken, noteId);
      } catch (err) {
        rollback(deletedNotes, err);
        const error = toError(err);
        throw error;
      }
    },
    [accessToken, notes]
  );

  const deleteNotesByIds = useCallback(
    async (noteIds: string[]): Promise<void> => {
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
      setError(null);

      const { applyOptimistic, rollback } = withOptimisticDelete(
        notes,
        noteIds,
        setNotes,
        error => {
          setError(error);
        }
      );

      const deletedNotes = applyOptimistic();

      try {
        await Promise.all(
          noteIds.map(id => driveService.deleteNote(accessToken, id))
        );
      } catch (err) {
        rollback(deletedNotes, err);
        const error = toError(err);
        throw error;
      }
    },
    [accessToken, notes]
  );

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    saveNote,
    updateNote,
    regenerateNote,
    deleteTagFromNote,
    deleteNote,
    deleteNotesByIds,
  };
}
