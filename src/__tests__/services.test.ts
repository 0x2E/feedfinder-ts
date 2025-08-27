import { describe, it, expect } from "vitest";
import { GitHubMatcher } from "../services/github.js";
import { RedditMatcher } from "../services/reddit.js";
import { YouTubeMatcher } from "../services/youtube.js";

describe("Service Matchers", () => {
  describe("GitHubMatcher", () => {
    const matcher = new GitHubMatcher();

    it("should match GitHub URLs", () => {
      expect(matcher.match(new URL("https://github.com"))).toBe(true);
      expect(matcher.match(new URL("https://github.com/user/repo"))).toBe(true);
      expect(matcher.match(new URL("https://example.com"))).toBe(false);
    });

    it("should generate repository feeds", async () => {
      const feeds = await matcher.getFeeds(
        new URL("https://github.com/golang/go"),
        {} as any,
      );

      expect(feeds).toHaveLength(4);
      expect(feeds[0].title).toBe("golang/go commits");
      expect(feeds[0].link).toBe("https://github.com/golang/go/commits.atom");
    });

    it("should generate user feeds", async () => {
      const feeds = await matcher.getFeeds(
        new URL("https://github.com/golang"),
        {} as any,
      );

      expect(feeds).toHaveLength(1);
      expect(feeds[0].title).toBe("golang public timeline");
      expect(feeds[0].link).toBe("https://github.com/golang.atom");
    });
  });

  describe("RedditMatcher", () => {
    const matcher = new RedditMatcher();

    it("should match Reddit URLs", () => {
      expect(matcher.match(new URL("https://reddit.com"))).toBe(true);
      expect(
        matcher.match(new URL("https://www.reddit.com/r/typescript")),
      ).toBe(true);
      expect(matcher.match(new URL("https://example.com"))).toBe(false);
    });

    it("should generate subreddit feeds", async () => {
      const feeds = await matcher.getFeeds(
        new URL("https://reddit.com/r/typescript"),
        {} as any,
      );

      expect(feeds).toHaveLength(4);
      expect(feeds[0].title).toBe("/r/typescript hot");
      expect(feeds[0].link).toBe("https://reddit.com/r/typescript/hot/.rss");
    });

    it("should generate user feeds", async () => {
      const feeds = await matcher.getFeeds(
        new URL("https://reddit.com/user/testuser"),
        {} as any,
      );

      expect(feeds.length).toBeGreaterThan(5);
      expect(feeds[0].title).toContain("testuser");
    });
  });

  describe("YouTubeMatcher", () => {
    const matcher = new YouTubeMatcher();

    it("should match YouTube URLs", () => {
      expect(matcher.match(new URL("https://youtube.com"))).toBe(true);
      expect(matcher.match(new URL("https://www.youtube.com/watch"))).toBe(
        true,
      );
      expect(matcher.match(new URL("https://www.youtube.com/@Fireship"))).toBe(
        true,
      );
      expect(matcher.match(new URL("https://example.com"))).toBe(false);
    });

    it("should generate playlist feeds", async () => {
      const feeds = await matcher.getFeeds(
        new URL(
          "https://www.youtube.com/playlist?list=PLlaN88a7y2_plecYoJxvRFTLHVbIVAOoc",
        ),
        {} as any,
      );

      expect(feeds).toHaveLength(1);
      expect(feeds[0].title).toBe("Playlist");
      expect(feeds[0].link).toBe(
        "https://www.youtube.com/feeds/videos.xml?playlist_id=PLlaN88a7y2_plecYoJxvRFTLHVbIVAOoc",
      );
    });
  });
});
