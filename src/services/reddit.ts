import type { Feed, ServiceMatcher, FeedFinderOptions } from "../types.js";

const REDDIT_GLOBAL_FEEDS: Feed[] = [
  { title: "global", link: "https://www.reddit.com/.rss" },
];

export class RedditMatcher implements ServiceMatcher {
  match(url: URL): boolean {
    return url.hostname.endsWith("reddit.com");
  }

  async getFeeds(url: URL, _options: FeedFinderOptions): Promise<Feed[]> {
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      return REDDIT_GLOBAL_FEEDS;
    }

    const mode = pathParts[0];
    const param = pathParts[1];

    switch (mode) {
      case "r":
        if (pathParts.length >= 3 && pathParts[2].startsWith("comments")) {
          // Post comments feed
          return this.generateCommentFeeds(url.href);
        }
        // Subreddit feeds
        return this.generateSubredditFeeds(param);

      case "user":
        // User feeds
        return this.generateUserFeeds(param);

      case "domain":
        // Domain submission feeds
        return this.generateDomainFeeds(param);

      default:
        return [];
    }
  }

  private generateSubredditFeeds(subreddit: string): Feed[] {
    return [
      {
        title: `/r/${subreddit} hot`,
        link: `https://reddit.com/r/${subreddit}/hot/.rss`,
      },
      {
        title: `/r/${subreddit} new`,
        link: `https://reddit.com/r/${subreddit}/new/.rss`,
      },
      {
        title: `/r/${subreddit} top`,
        link: `https://reddit.com/r/${subreddit}/top/.rss`,
      },
      {
        title: `/r/${subreddit} rising`,
        link: `https://reddit.com/r/${subreddit}/rising/.rss`,
      },
    ];
  }

  private generateCommentFeeds(fullURL: string): Feed[] {
    return [
      {
        title: "post",
        link: `${fullURL}.rss`,
      },
    ];
  }

  private generateUserFeeds(username: string): Feed[] {
    return [
      {
        title: `/u/${username} overview new`,
        link: `https://reddit.com/user/${username}/.rss?sort=new`,
      },
      {
        title: `/u/${username} overview hot`,
        link: `https://reddit.com/user/${username}/.rss?sort=hot`,
      },
      {
        title: `/u/${username} overview top`,
        link: `https://reddit.com/user/${username}/.rss?sort=top`,
      },
      {
        title: `/u/${username} post new`,
        link: `https://reddit.com/user/${username}/submitted/.rss?sort=new`,
      },
      {
        title: `/u/${username} post hot`,
        link: `https://reddit.com/user/${username}/submitted/.rss?sort=hot`,
      },
      {
        title: `/u/${username} post top`,
        link: `https://reddit.com/user/${username}/submitted/.rss?sort=top`,
      },
      {
        title: `/u/${username} comments new`,
        link: `https://reddit.com/user/${username}/comments/.rss?sort=new`,
      },
      {
        title: `/u/${username} comments hot`,
        link: `https://reddit.com/user/${username}/comments/.rss?sort=hot`,
      },
      {
        title: `/u/${username} comments top`,
        link: `https://reddit.com/user/${username}/comments/.rss?sort=top`,
      },
      {
        title: `/u/${username} awards received (legacy)`,
        link: `https://old.reddit.com/user/${username}/gilded/.rss`,
      },
    ];
  }

  private generateDomainFeeds(domain: string): Feed[] {
    return [
      {
        title: `/domain/${domain}`,
        link: `https://reddit.com/domain/${domain}/.rss`,
      },
    ];
  }
}
