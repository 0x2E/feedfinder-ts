import type { Feed } from "./types.js";

/**
 * Convert relative URL to absolute URL
 */
export function absURL(base: string, link: string): string {
  if (!link) return base;

  try {
    const linkURL = new URL(link);
    return linkURL.href; // Already absolute
  } catch {
    // Relative URL
    try {
      const baseURL = new URL(base);
      return new URL(link, baseURL).href;
    } catch {
      return link; // Return as-is if base URL is invalid
    }
  }
}

/**
 * Check if feed is empty
 */
export function isEmptyFeed(feed: Feed): boolean {
  return !feed.title && !feed.link;
}

/**
 * Deduplicate feeds by link
 */
export function deduplicateFeeds(feeds: Feed[]): Feed[] {
  const seen = new Set<string>();
  return feeds.filter((feed) => {
    if (seen.has(feed.link)) {
      return false;
    }
    seen.add(feed.link);
    return true;
  });
}

/**
 * Sleep for given milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Simple fetch wrapper with timeout and default headers
 */
export async function fetchWithOptions(
  url: string,
  options: {
    timeout?: number;
    userAgent?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<{ text: string; status: number; url: string }> {
  const {
    timeout = 60000,
    userAgent = "feedfinder-ts/1.0.0",
    headers = {},
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        ...headers,
      },
      signal: controller.signal,
      mode: isBrowser() ? "cors" : undefined,
    });

    const text = await response.text();
    return { text, status: response.status, url: response.url };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
