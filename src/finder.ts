import type { Feed, FeedFinderOptions } from "./types.js";
import { parseHTMLContent, parseRSSContent } from "./parser.js";
import { tryWellKnown } from "./well-known.js";
import { tryServices } from "./services/index.js";
import { deduplicateFeeds, isEmptyFeed, fetchWithOptions } from "./utils.js";

export class FeedFinder {
  private targetURL: URL;
  private options: FeedFinderOptions;

  constructor(target: string, options: FeedFinderOptions = {}) {
    this.targetURL = new URL(target);
    this.options = options;
  }

  /**
   * Find all available feeds for the target URL
   */
  async find(): Promise<Feed[]> {
    // Try third-party services first (GitHub, Reddit, YouTube)
    const serviceFeeds = await tryServices(this.targetURL, this.options);
    if (serviceFeeds.length > 0) {
      return serviceFeeds;
    }

    // Run HTML parsing and well-known paths concurrently
    const [htmlFeeds, wellKnownFeeds] = await Promise.allSettled([
      this.tryPageSource(),
      tryWellKnown(this.targetURL.href, this.options),
    ]);

    const allFeeds: Feed[] = [];

    // Add HTML parsing results
    if (htmlFeeds.status === "fulfilled") {
      allFeeds.push(...htmlFeeds.value);
    } else {
      console.debug("HTML parsing failed:", htmlFeeds.reason);
    }

    // Add well-known paths results
    if (wellKnownFeeds.status === "fulfilled") {
      allFeeds.push(...wellKnownFeeds.value);
    } else {
      console.debug("Well-known paths failed:", wellKnownFeeds.reason);
    }

    return deduplicateFeeds(allFeeds);
  }

  /**
   * Try to parse the page source for feed links
   */
  private async tryPageSource(): Promise<Feed[]> {
    try {
      const response = await fetchWithOptions(
        this.targetURL.href,
        this.options,
      );

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const content = response.text;

      // First try to parse as HTML for feed links
      const htmlFeeds = parseHTMLContent(content, this.targetURL.href);
      if (htmlFeeds.length > 0) {
        return htmlFeeds;
      }

      // If no HTML feeds found, try parsing as RSS/Atom directly
      const rssFeed = parseRSSContent(content);
      if (!isEmptyFeed(rssFeed)) {
        if (!rssFeed.link) {
          rssFeed.link = this.targetURL.href;
        }
        return [rssFeed];
      }

      return [];
    } catch (error) {
      console.debug("Page source parsing failed:", error);
      return [];
    }
  }
}

/**
 * Main entry point - find feeds for a given URL
 */
export async function find(
  target: string,
  options: FeedFinderOptions = {},
): Promise<Feed[]> {
  const finder = new FeedFinder(target, options);
  return finder.find();
}
