/// <reference types="node" />

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Note {
  id: string;
  name: string; // Filename
  title: string; // AI-generated title, can be user-edited
  content: string; // Full original content
  summary: string; // AI-generated detailed summary
  aiGenerated: {
    title: string;
    summary: string;
    rationale: string;
  } | null;
  categoryPath: string[];
  tags: string[];
  date: string; // ISO 8601 format
}

export interface AICategorizationResult {
  title: string;
  summary: string;
  categories: string[];
  tags: string[];
  icon: string;
  rationale: string;
}

export interface AITextSession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

declare global {
  interface Window {
    ai?: {
      canCreateTextSession(): Promise<'readily' | 'after-download' | 'no'>;
      createTextSession(): Promise<AITextSession>;
    };
  }
}