import type { Feed, ServiceMatcher, FeedFinderOptions } from "../types.js";

const GITHUB_GLOBAL_FEEDS: Feed[] = [
  { title: "global public timeline", link: "https://github.com/timeline" },
  {
    title: "global security advisories",
    link: "https://github.com/security-advisories.atom",
  },
];

export class GitHubMatcher implements ServiceMatcher {
  match(url: URL): boolean {
    return url.hostname.endsWith("github.com");
  }

  async getFeeds(url: URL, _options: FeedFinderOptions): Promise<Feed[]> {
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      return GITHUB_GLOBAL_FEEDS;
    }

    const username = pathParts[0];
    const reponame = pathParts[1];

    // Repository feeds
    if (reponame && this.isValidRepoName(reponame)) {
      return this.generateRepoFeeds(`${username}/${reponame}`);
    }

    // User feeds
    if (username && this.isValidUsername(username)) {
      return this.generateUserFeeds(username);
    }

    return [];
  }

  private isValidRepoName(name: string): boolean {
    // GitHub repo name pattern: alphanumeric, hyphens, dots, underscores
    // Must start and end with alphanumeric, 1-100 chars
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-_.]{0,98}[a-zA-Z0-9]$/;
    return pattern.test(name);
  }

  private isValidUsername(name: string): boolean {
    // GitHub username pattern: alphanumeric and hyphens
    // Cannot start or end with hyphen, 1-39 chars
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return pattern.test(name);
  }

  private generateUserFeeds(username: string): Feed[] {
    return [
      {
        title: `${username} public timeline`,
        link: `https://github.com/${username}.atom`,
      },
    ];
  }

  private generateRepoFeeds(userRepo: string): Feed[] {
    return [
      {
        title: `${userRepo} commits`,
        link: `https://github.com/${userRepo}/commits.atom`,
      },
      {
        title: `${userRepo} releases`,
        link: `https://github.com/${userRepo}/releases.atom`,
      },
      {
        title: `${userRepo} tags`,
        link: `https://github.com/${userRepo}/tags.atom`,
      },
      {
        title: `${userRepo} wiki`,
        link: `https://github.com/${userRepo}/wiki.atom`,
      },
    ];
  }
}
