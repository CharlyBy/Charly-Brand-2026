// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import { ENV } from './_core/env';

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

/**
 * Delete a file from storage
 * Extracts the storage key from a full URL and issues a DELETE request.
 * 
 * DSGVO: Audiodateien müssen nach Transkription gelöscht werden,
 * da sie personenbezogene Daten (Stimme) enthalten.
 */
export async function storageDelete(relKeyOrUrl: string): Promise<boolean> {
  try {
    const { baseUrl, apiKey } = getStorageConfig();

    // If a full URL is passed, extract the relative key
    let key = relKeyOrUrl;
    if (relKeyOrUrl.startsWith('http')) {
      // Try to extract path from URL (e.g., voice-recordings/xxx.webm)
      const urlObj = new URL(relKeyOrUrl);
      // The path parameter is typically in the URL path or query
      // For Manus storage, the key is usually the path after the bucket
      const pathMatch = urlObj.pathname.match(/voice-recordings\/[^?]+/);
      if (pathMatch) {
        key = pathMatch[0];
      } else {
        // Fallback: use full path after first slash
        key = urlObj.pathname.replace(/^\/+/, '');
      }
    }
    key = normalizeKey(key);

    const deleteUrl = new URL("v1/storage/delete", ensureTrailingSlash(baseUrl));
    deleteUrl.searchParams.set("path", key);

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: buildAuthHeaders(apiKey),
    });

    if (response.ok) {
      console.log(`[Storage] Deleted: ${key}`);
      return true;
    }

    // If 404, the file was already deleted - that's ok
    if (response.status === 404) {
      console.log(`[Storage] File already deleted: ${key}`);
      return true;
    }

    console.error(`[Storage] Failed to delete ${key}: ${response.status} ${response.statusText}`);
    return false;
  } catch (error) {
    console.error('[Storage] Delete error:', error);
    return false;
  }
}
