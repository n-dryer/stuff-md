import { authorizedFetch } from './apiHelpers';
import { logError } from '../../utils/logger';

// Clear folder cache on auth error, as it might be stale across logins.
export const onAuthError = () => {
  clearFolderCache();
};

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const APP_FOLDER_NAME = 'STUFF.MD Notes';
const APP_FOLDER_QUERY = `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

let appFolderIdCache: string | null = null;

/**
 * Clear folder cache (useful for testing or when folder might have changed)
 */
export const clearFolderCache = () => {
  appFolderIdCache = null;
};

/**
 * Find or create the app folder in Google Drive
 */
export const findOrCreateAppFolder = async (
  accessToken: string,
  signal?: AbortSignal
): Promise<string> => {
  if (appFolderIdCache) return appFolderIdCache;

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
      appFolderIdCache = folderId;
      return appFolderIdCache;
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
    appFolderIdCache = createResult.id;
    return appFolderIdCache;
  }
  throw new Error('Failed to get folder ID from create response.');
};
