/** microCMS などの画像 URL を Next/Image 用に正規化する */
export function normalizeImageUrl(
  url: string | undefined | null,
): string | null {
  if (!url) return null;

  const normalized = url.trim().replace(/\u3000/g, "");
  if (!normalized) return null;

  try {
    new URL(normalized);
    return normalized;
  } catch {
    return null;
  }
}
