import type { Feed, ServiceMatcher, FeedFinderOptions } from "../types.js";
import { fetchWithOptions } from "../utils.js";

export class YouTubeMatcher implements ServiceMatcher {
  match(url: URL): boolean {
    return (
      url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtu.be")
    );
  }

  async getFeeds(url: URL, options: FeedFinderOptions): Promise<Feed[]> {
    try {
      // Handle channel URLs like /@channelname
      if (url.pathname.startsWith("/@")) {
        return await this.getChannelFeedById(url, options);
      }

      // Handle playlist URLs
      if (url.pathname.startsWith("/playlist")) {
        return this.getPlaylistFeed(url);
      }

      return [];
    } catch (error) {
      console.debug("YouTube matcher error:", error);
      return [];
    }
  }

  private async getChannelFeedById(
    url: URL,
    options: FeedFinderOptions,
  ): Promise<Feed[]> {
    try {
      const response = await fetchWithOptions(url.href, options);
      const content = response.text;

      // Extract channel ID from page content
      const channelIdMatch = content.match(
        /{"key":"browse_id","value":"(.+?)"}/,
      );

      if (channelIdMatch && channelIdMatch[1]) {
        const channelId = channelIdMatch[1];
        return [
          {
            title: "Channel",
            link: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
          },
        ];
      }

      return [];
    } catch (error) {
      console.debug("Failed to get YouTube channel ID:", error);
      return [];
    }
  }

  private getPlaylistFeed(url: URL): Feed[] {
    const playlistId = url.searchParams.get("list");

    if (!playlistId) {
      return [];
    }

    return [
      {
        title: "Playlist",
        link: `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
      },
    ];
  }
}
