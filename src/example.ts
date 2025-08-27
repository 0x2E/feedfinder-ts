import { find } from "./index.js";

/**
 * Example usage of feedfinder-ts
 */
async function example() {
  try {
    console.log("Finding feeds for GitHub repository...");
    const githubFeeds = await find("https://github.com/golang/go");
    console.log("GitHub feeds:", githubFeeds);

    console.log("\nFinding feeds for Reddit subreddit...");
    const redditFeeds = await find("https://reddit.com/r/typescript");
    console.log("Reddit feeds:", redditFeeds);

    console.log("\nFinding feeds for a blog...");
    const blogFeeds = await find("https://blog.golang.org");
    console.log("Blog feeds:", blogFeeds);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example();
}
