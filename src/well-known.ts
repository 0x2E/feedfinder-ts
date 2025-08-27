import type { Feed, FeedFinderOptions } from "./types.js";
import { parseRSSContent } from "./parser.js";
import { isEmptyFeed, fetchWithOptions } from "./utils.js";

const WELL_KNOWN_PATHS = [
  "atom.xml",
  "feed.xml",
  "rss.xml",
  "index.xml",
  "atom.json",
  "feed.json",
  "rss.json",
  "index.json",
  "feed/",
  "rss/",
];

/**
 * Try to find feeds in well-known paths
 */
export async function tryWellKnown(
  baseURL: string,
  options: FeedFinderOptions,
): Promise<Feed[]> {
  const feeds: Feed[] = [];

  // Try paths under the given URL first
  for (const path of WELL_KNOWN_PATHS) {
    try {
      const targetURL = new URL(path, baseURL).href;
      const feed = await parseRSSUrl(targetURL, options);

      if (!isEmptyFeed(feed)) {
        feed.link = targetURL; // Use the actual URL that worked
        feeds.push(feed);
      }
    } catch (error) {
      // Ignore errors for individual paths
      console.debug(`Failed to check well-known path ${path}:`, error);
    }
  }

  // If no feeds found, try under root path
  if (feeds.length === 0) {
    const url = new URL(baseURL);
    const rootURL = `${url.protocol}//${url.host}`;

    if (rootURL !== baseURL) {
      for (const path of WELL_KNOWN_PATHS) {
        try {
          const targetURL = new URL(path, rootURL).href;
          const feed = await parseRSSUrl(targetURL, options);

          if (!isEmptyFeed(feed)) {
            feed.link = targetURL;
            feeds.push(feed);
          }
        } catch (error) {
          console.debug(`Failed to check root well-known path ${path}:`, error);
        }
      }
    }
  }

  return feeds;
}

/**
 * Parse RSS content from URL
 */
async function parseRSSUrl(
  url: string,
  options: FeedFinderOptions,
): Promise<Feed> {
  try {
    const response = await fetchWithOptions(url, options);

    if (response.status !== 200) {
      return { title: "", link: "" };
    }

    return parseRSSContent(response.text);
  } catch (error) {
    console.debug(`Failed to parse RSS from ${url}:`, error);
    return { title: "", link: "" };
  }
}
