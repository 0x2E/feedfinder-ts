import { describe, it, expect } from "vitest";
import { absURL, isEmptyFeed, deduplicateFeeds } from "../utils.js";
import type { Feed } from "../types.js";

describe("Utils", () => {
  describe("absURL", () => {
    it("should handle absolute URLs", () => {
      const result = absURL(
        "https://example.com",
        "https://other.com/feed.xml",
      );
      expect(result).toBe("https://other.com/feed.xml");
    });

    it("should convert relative URLs to absolute", () => {
      const result = absURL("https://example.com/page", "feed.xml");
      expect(result).toBe("https://example.com/feed.xml");
    });

    it("should handle relative paths with directories", () => {
      const result = absURL("https://example.com/blog/", "../feed.xml");
      expect(result).toBe("https://example.com/feed.xml");
    });

    it("should return base URL for empty link", () => {
      const result = absURL("https://example.com", "");
      expect(result).toBe("https://example.com");
    });
  });

  describe("isEmptyFeed", () => {
    it("should return true for empty feed", () => {
      expect(isEmptyFeed({ title: "", link: "" })).toBe(true);
    });

    it("should return false for feed with title only", () => {
      expect(isEmptyFeed({ title: "Test", link: "" })).toBe(false);
    });

    it("should return false for feed with link only", () => {
      expect(isEmptyFeed({ title: "", link: "http://example.com" })).toBe(
        false,
      );
    });

    it("should return false for complete feed", () => {
      expect(isEmptyFeed({ title: "Test", link: "http://example.com" })).toBe(
        false,
      );
    });
  });

  describe("deduplicateFeeds", () => {
    it("should remove duplicate feeds by link", () => {
      const feeds: Feed[] = [
        { title: "Feed 1", link: "http://example.com/feed.xml" },
        { title: "Feed 2", link: "http://example.com/feed.xml" },
        { title: "Feed 3", link: "http://example.com/feed2.xml" },
      ];

      const result = deduplicateFeeds(feeds);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Feed 1");
      expect(result[1].link).toBe("http://example.com/feed2.xml");
    });

    it("should handle empty array", () => {
      expect(deduplicateFeeds([])).toEqual([]);
    });
  });
});
