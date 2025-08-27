# feedfinder-ts

A TypeScript library for discovering RSS and Atom feeds from website URLs through HTML parsing and intelligent path detection, compatible with both Node.js and browsers.

This is a TypeScript port of the [original Go implementation](https://github.com/0x2E/feedfinder), mostly ported by AI.

## Features

- **URL-based Feed Discovery**: Automatically discovers RSS and Atom feeds from any website URL
- **Intelligent HTML Parsing**: Searches for feed links in `<link>` and `<a>` tags within web pages
- **Smart Path Detection**: Checks common feed file locations and well-known paths
- **Universal**: Works in both Node.js (≥22) and browser environments
- **Fast**: Concurrent processing for optimal performance
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Third-party Services**: Additional support for GitHub, Reddit, and YouTube feeds

## Installation

```bash
npm install feedfinder-ts
```

## Usage

### Basic Usage

```typescript
import { find } from "feedfinder-ts";

// Discover feeds from a blog or news website
const feeds = await find("https://example.com/blog");
console.log(feeds);
// Output:
// [
//   { title: "Latest Posts", link: "https://example.com/feed.xml" },
//   { title: "RSS Feed", link: "https://example.com/rss.xml" },
//   { title: "Blog Updates", link: "https://example.com/atom.xml" }
// ]

// Works with any website that has RSS/Atom feeds
const newsFeeds = await find("https://news.ycombinator.com");
```

### With Options

```typescript
import { find } from "feedfinder-ts";

const feeds = await find("https://example.com/blog", {
  timeout: 30000,
  userAgent: "My App/1.0.0",
  headers: {
    "Accept-Language": "en-US,en;q=0.9",
  },
});
```

### Using the FeedFinder Class

```typescript
import { FeedFinder } from "feedfinder-ts";

const finder = new FeedFinder("https://example.com/blog", {
  timeout: 60000,
});

const feeds = await finder.find();
console.log(feeds);
```

## How It Works

The library discovers feeds from URLs using multiple intelligent strategies:

### 1. HTML Parsing (Primary Method)

The core feed discovery method that analyzes web page content:

- **Link tag analysis**: Searches for `<link>` tags with feed types:
  - `application/rss+xml`
  - `application/atom+xml`
  - `application/json`
  - `application/feed+json`
- **Anchor tag discovery**: Finds `<a>` tags containing "RSS", "Feed", or "Atom" text
- **Content-based detection**: Intelligently parses HTML to locate feed references

### 2. Well-known Path Detection

Systematically checks common feed file locations:

- **Standard feed files**: `atom.xml`, `feed.xml`, `rss.xml`, `index.xml`
- **JSON feeds**: `atom.json`, `feed.json`, `rss.json`, `index.json`
- **Common directories**: `feed/`, `rss/`

Searches both under the target URL path and the root domain for comprehensive coverage.

### 3. Third-party Services (Additional Support)

Enhanced support for popular platforms:

- **GitHub**: Repository feeds (commits, releases, tags, wiki), user feeds
- **Reddit**: Subreddit feeds (hot, new, top, rising), user feeds, comment feeds
- **YouTube**: Channel and playlist feeds (extracted from page content)

## API Reference

### `find(target: string, options?: FeedFinderOptions): Promise<Feed[]>`

Main entry point to find feeds for a given URL.

**Parameters:**

- `target`: The URL to search for feeds
- `options`: Optional configuration object

**Returns:** Promise that resolves to an array of Feed objects

### `FeedFinderOptions`

```typescript
interface FeedFinderOptions {
  requestProxy?: string; // HTTP proxy URL
  timeout?: number; // Request timeout in milliseconds (default: 60000)
  userAgent?: string; // Custom User-Agent header
  headers?: Record<string, string>; // Additional HTTP headers
}
```

### `Feed`

```typescript
interface Feed {
  title: string; // Feed title
  link: string; // Feed URL
}
```

## Browser Support

The library works in modern browsers that support:

- ES2020 features
- Fetch API
- AbortController

For older browsers, you may need polyfills.

## Node.js Support

Requires Node.js ≥22.0.0.

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Build the library
pnpm run build

# Run linting
pnpm run lint

# Type checking
pnpm run typecheck
```

## Credits

- Original Go implementation: [0x2E/feedfinder](https://github.com/0x2E/feedfinder)
- XML parsing: [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- HTML parsing: [cheerio](https://github.com/cheeriojs/cheerio)

## License

MIT
