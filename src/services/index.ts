import type { Feed, ServiceMatcher, FeedFinderOptions } from "../types.js";
import { GitHubMatcher } from "./github.js";
import { RedditMatcher } from "./reddit.js";
import { YouTubeMatcher } from "./youtube.js";

const SERVICE_MATCHERS: ServiceMatcher[] = [
  new GitHubMatcher(),
  new RedditMatcher(),
  new YouTubeMatcher(),
];

/**
 * Try to find feeds using third-party service patterns
 */
export async function tryServices(
  url: URL,
  options: FeedFinderOptions,
): Promise<Feed[]> {
  for (const matcher of SERVICE_MATCHERS) {
    if (matcher.match(url)) {
      try {
        const feeds = await matcher.getFeeds(url, options);
        if (feeds.length > 0) {
          return feeds;
        }
      } catch (error) {
        console.debug(`Service matcher error for ${url.hostname}:`, error);
        // Continue to next matcher
      }
    }
  }

  return [];
}
