import {
  declaration,
  serialize,
  tag,
} from "https://raw.githubusercontent.com/olaven/serialize-xml/v0.4.0/mod.ts";
import { requireAuth, requireBasicAuth, requireSubscription } from "../auth.ts";

import type { Episode, Podcast } from "../podme.ts";
import { errorHandler, request } from "../utils.ts";

export async function feed(pattern: URLPatternResult, req: Request) {
  const { id } = pattern.pathname.groups;
  try {
    const { email, password } = requireBasicAuth(req);
    const authResponse = await requireAuth(email, password);
    await requireSubscription(authResponse);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${Deno.env.get("ACCESS_TOKEN")}`);

    const [podcast, episodes] = await Promise.all([
      request<Podcast>(`mobile/api/v2/podcasts/${id}`, { headers }),
      request<Episode[]>(
        `mobile/api/v2/episodes/podcast/${id}`,
        { headers },
      ),
    ]);

    return new Response(template(podcast, episodes), {
      status: 200,
      headers: {
        "content-type": "application/rss+xml",
      },
    });
  } catch (error) {
    console.log(error);
    let status = 404;
    if (error instanceof Response) {
      status = error.status;
    }
    return errorHandler(status);
  }
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
          tag("lastBuildDate", new Date(episodes[0].publishDate).toUTCString()),
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
              tag("pubDate", new Date(episode.publishDate).toUTCString()),
              tag("title", episode.title),
              tag("itunes:title", episode.title),
              tag("itunes:episode", episode.number.toString()),
              tag("itunes:author", episode.authorFullName),
              tag("itunes:subtitle", episode.subtitle),
              tag("itunes:duration", episode.length),
              tag("link", link),
              tag("description", episode.description),
              tag("enclosure", "", [
                ["url", episode.url],
                ["length", episode.byteLength.toString()],
                ["type", episode.type],
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
