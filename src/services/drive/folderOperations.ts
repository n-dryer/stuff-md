import { authorizedFetch } from './apiHelpers';
import { logError } from '../../utils/logger';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const APP_FOLDER_NAME = 'STUFF.MD Notes';
const APP_FOLDER_QUERY = `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
const FOLDER_CACHE_KEY = 'stuff_md_app_folder_id';

let appFolderIdCache: string | null = null;

/**
 * Load folder ID from localStorage cache
 */
const loadFolderCache = (): string | null => {
  if (appFolderIdCache) return appFolderIdCache;
  try {
    const cached = localStorage.getItem(FOLDER_CACHE_KEY);
    if (cached) {
      appFolderIdCache = cached;
      return cached;
    }
  } catch (error) {
    // localStorage might be unavailable (e.g., in private browsing)
    logError('Failed to load folder cache from localStorage:', error);
  }
  return null;
};

/**
 * Save folder ID to localStorage cache
 */
const saveFolderCache = (folderId: string): void => {
  appFolderIdCache = folderId;
  try {
    localStorage.setItem(FOLDER_CACHE_KEY, folderId);
  } catch (error) {
    // localStorage might be unavailable (e.g., in private browsing)
    logError('Failed to save folder cache to localStorage:', error);
  }
};

/**
 * Clear folder cache (useful for testing or when folder might have changed)
 */
export const clearFolderCache = () => {
  appFolderIdCache = null;
  try {
    localStorage.removeItem(FOLDER_CACHE_KEY);
  } catch (error) {
    logError('Failed to clear folder cache from localStorage:', error);
  }
};

/**
 * Find or create the app folder in Google Drive
 */
export const findOrCreateAppFolder = async (
  accessToken: string,
  signal?: AbortSignal
): Promise<string> => {
  // Try to load from cache first
  const cached = loadFolderCache();
  if (cached) return cached;

  const searchResponse = await authorizedFetch(
    accessToken,
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(APP_FOLDER_QUERY)}&fields=files(id)`,
    {},
    true,
    signal
  );
  if (!searchResponse.ok) throw new Error('Failed to search for app folder.');
  let searchResult: { files?: Array<{ id?: string }> };
  try {
    searchResult = (await searchResponse.json()) as {
      files?: Array<{ id?: string }>;
    };
  } catch (error) {
    logError('Failed to parse folder search response:', error);
    throw new Error('Invalid response format from Google Drive API.');
  }

  if (searchResult.files && searchResult.files.length > 0) {
    const folderId = searchResult.files[0].id;
    if (typeof folderId === 'string') {
      saveFolderCache(folderId);
      return folderId;
    }
  }

  const createResponse = await authorizedFetch(
    accessToken,
    `${DRIVE_API_URL}/files`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    },
    true,
    signal
  );
  if (!createResponse.ok) throw new Error('Failed to create app folder.');
  let createResult: { id?: string };
  try {
    createResult = (await createResponse.json()) as { id?: string };
  } catch (error) {
    logError('Failed to parse folder create response:', error);
    throw new Error('Invalid response format from Google Drive API.');
  }
  if (typeof createResult.id === 'string') {
    saveFolderCache(createResult.id);
    return createResult.id;
  }
  throw new Error('Failed to get folder ID from create response.');
};
