import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import type { Feed } from "./types.js";
import { absURL } from "./utils.js";

/**
 * Check if content is valid RSS/Atom XML
 */
function isValidRSSContent(content: string): boolean {
  // Basic XML structure check
  const trimmedContent = content.trim();
  
  // Must start with XML declaration or root element
  if (!trimmedContent.startsWith('<?xml') && !trimmedContent.startsWith('<rss') && !trimmedContent.startsWith('<feed')) {
    return false;
  }
  
  // Must contain RSS or Atom root elements
  return trimmedContent.includes('<rss') || trimmedContent.includes('<feed');
}

/**
 * Parse RSS/Atom content from XML
 */
export function parseRSSContent(content: string): Feed {
  try {
    // First check if content looks like RSS/Atom XML
    if (!isValidRSSContent(content)) {
      return { title: "", link: "" };
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      removeNSPrefix: false,
    });

    const parsed = parser.parse(content);

    // Try RSS format
    if (parsed.rss?.channel) {
      const channel = parsed.rss.channel;
      return {
        title: channel.title || "",
        link: channel.link || "",
      };
    }

    // Try Atom format
    if (parsed.feed) {
      const feed = parsed.feed;
      let link = "";

      // Atom link can be array or single object
      if (feed.link) {
        if (Array.isArray(feed.link)) {
          // Find self link or use first
          const selfLink = feed.link.find((l: any) => l["@_rel"] === "self");
          link = selfLink?.["@_href"] || feed.link[0]?.["@_href"] || "";
        } else if (typeof feed.link === "object") {
          link = feed.link["@_href"] || "";
        } else {
          link = feed.link;
        }
      }

      return {
        title: feed.title?.["#text"] || feed.title || "",
        link,
      };
    }

    return { title: "", link: "" };
  } catch (error) {
    console.debug("Failed to parse RSS content:", error);
    return { title: "", link: "" };
  }
}

/**
 * Parse HTML content to find feed links
 */
export function parseHTMLContent(content: string, baseURL: string): Feed[] {
  const feeds: Feed[] = [];

  try {
    const $ = cheerio.load(content);
    const pageTitle = $("title").text().trim();

    // Find <link> tags with feed types in <head>
    const linkSelectors = [
      "link[type='application/rss+xml']",
      "link[type='application/atom+xml']",
      "link[type='application/json']",
      "link[type='application/feed+json']",
    ];

    for (const selector of linkSelectors) {
      $("head")
        .find(selector)
        .each((_i, element) => {
          const $el = $(element);
          const title = $el.attr("title") || pageTitle;
          const href = $el.attr("href");

          if (href) {
            feeds.push({
              title,
              link: absURL(baseURL, href),
            });
          }
        });
    }

    // Find <a> tags containing 'rss' in body
    const suspectedLinks = new Set<string>();
    $("body")
      .find("a:contains('rss'), a:contains('RSS')")
      .each((_i, element) => {
        const href = $(element).attr("href");
        if (href) {
          suspectedLinks.add(href);
        }
      });

    // Note: In the original Go version, these suspected links are validated by making HTTP requests
    // For the initial implementation, we'll just add them to the list
    for (const link of suspectedLinks) {
      feeds.push({
        title: pageTitle,
        link: absURL(baseURL, link),
      });
    }

    return feeds;
  } catch (error) {
    console.debug("Failed to parse HTML content:", error);
    return [];
  }
}
