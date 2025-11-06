import { Note } from '../types';

export interface INoteStorageService {
  getAllNotes(accessToken: string): Promise<Note[]>;
  createNote(accessToken: string, noteData: Omit<Note, 'id'>): Promise<Note>;
  updateNote(
    accessToken: string,
    noteId: string,
    noteData: Partial<Note>
  ): Promise<Note>;
  deleteNote(accessToken: string, noteId: string): Promise<void>;
  deleteNotesByIds(accessToken: string, noteIds: string[]): Promise<void>;
}
