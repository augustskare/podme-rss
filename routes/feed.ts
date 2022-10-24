import {
  declaration,
  serialize,
  tag,
} from "https://raw.githubusercontent.com/olaven/serialize-xml/v0.4.0/mod.ts";

import type { RouteArgs } from "../utils/router.ts";
import type { Episode, Podcast } from "../utils/podme.ts";
import { getPodcast } from "../utils/podme.ts";
import { authenticate, requireBasicAuth } from "../utils/auth.ts";

export async function feed({ pattern, request }: RouteArgs) {
  const { slug } = pattern.pathname.groups;
  const { username, password } = requireBasicAuth(request);
  const { access_token } = await authenticate(username, password);
  const { podcast, episodes } = await getPodcast(slug, access_token);

  return new Response(template(podcast, episodes), {
    status: 200,
    headers: {
      "content-type": "application/rss+xml",
    },
  });
}

function template(podcast: Podcast, episodes: Episode[]) {
  return serialize(
    declaration([
      ["version", "1.0"],
      ["encoding", "UTF-8"],
    ]),
    tag(
      "rss",
      [
        tag("channel", [
          tag("title", podcast.title),
          tag("description", podcast.description),
          tag("itunes:author", podcast.authorFullName),
          tag("link", `https://podme.com/no/${podcast.slug}`),
          tag("lastBuildDate", new Date(episodes[0].dateAdded).toUTCString()),
          tag("itunes:image", "", [
            ["href", podcast.imageUrl || podcast.mediumImageUrl],
          ]),
          tag("itunes:owner", [
            tag("itunes:name", podcast.authorFullName),
            tag("itunes:email", "podcast@podme.com"),
          ]),
          ...episodes.map((episode) => {
            const link = `https://podme.com/no/${podcast.slug}/${episode.id}`;
            return tag("item", [
              tag("guid", link),
              tag("pubDate", episode.dateAdded),
              tag("pubDate", new Date(episode.dateAdded).toUTCString()),
              tag("title", episode.title),
              tag("itunes:title", episode.title),
              tag(
                "itunes:author",
                episode.authorFullName || podcast.authorFullName,
              ),
              tag("itunes:duration", episode.length),
              tag("link", link),
              tag("description", episode.description),
              tag("enclosure", "", [
                [
                  "url",
                  episode.streamUrl.replace("master.m3u8", "audio_128_pkg.mp4"),
                ],
                ["type", "audio/x-m4a"],
              ]),
            ]);
          }),
        ]),
      ],
      [
        ["version", "2.0"],
        ["xmlns:itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd"],
        ["xmlns:content", "http://purl.org/rss/1.0/modules/content/"],
      ],
    ),
  );
}
