import { describe, it, expect } from "vitest";
import { parseRSSContent, parseHTMLContent } from "../parser.js";

describe("Parser", () => {
  describe("parseRSSContent", () => {
    it("should parse RSS feed", () => {
      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test RSS Feed</title>
            <link>https://example.com/rss</link>
            <description>A test RSS feed</description>
          </channel>
        </rss>`;

      const result = parseRSSContent(rssXml);
      expect(result.title).toBe("Test RSS Feed");
      expect(result.link).toBe("https://example.com/rss");
    });

    it("should parse Atom feed", () => {
      const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>Test Atom Feed</title>
          <link href="https://example.com/atom" rel="self" />
          <updated>2023-01-01T00:00:00Z</updated>
        </feed>`;

      const result = parseRSSContent(atomXml);
      expect(result.title).toBe("Test Atom Feed");
      expect(result.link).toBe("https://example.com/atom");
    });

    it("should handle invalid XML", () => {
      const result = parseRSSContent("invalid xml");
      expect(result.title).toBe("");
      expect(result.link).toBe("");
    });
  });

  describe("parseHTMLContent", () => {
    it("should parse HTML with RSS link tags", () => {
      const html = `
        <html>
          <head>
            <title>Test Page</title>
            <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed.rss" />
            <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/feed.atom" />
          </head>
          <body>
            <h1>Welcome</h1>
          </body>
        </html>`;

      const feeds = parseHTMLContent(html, "https://example.com");
      expect(feeds).toHaveLength(2);
      expect(feeds[0].title).toBe("RSS Feed");
      expect(feeds[0].link).toBe("https://example.com/feed.rss");
      expect(feeds[1].title).toBe("Atom Feed");
      expect(feeds[1].link).toBe("https://example.com/feed.atom");
    });

    it("should parse HTML with RSS links in body", () => {
      const html = `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <a href="/rss.xml">RSS Feed</a>
            <a href="/feed/">RSS</a>
          </body>
        </html>`;

      const feeds = parseHTMLContent(html, "https://example.com");
      expect(feeds).toHaveLength(2);
      expect(feeds[0].link).toBe("https://example.com/rss.xml");
      expect(feeds[1].link).toBe("https://example.com/feed/");
    });

    it("should handle empty HTML", () => {
      const feeds = parseHTMLContent("", "https://example.com");
      expect(feeds).toEqual([]);
    });
  });
});
