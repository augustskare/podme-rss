import {
  declaration,
  serialize,
  tag,
} from "https://raw.githubusercontent.com/olaven/serialize-xml/v0.4.0/mod.ts";
import { requireAuth, requireBasicAuth } from "../auth.ts";

import type { AuthResponse, Episode, Podcast } from "../podme.ts";
import { errorHandler, request } from "../utils.ts";

export async function feed(pattern: URLPatternResult, req: Request) {
  const { slug } = pattern.pathname.groups;
  try {
    const podcast = request<Podcast>(`/web/api/v2/podcast/slug/${slug}`);
    const baseEpiosdes = request<Episode[]>(
      `/web/api/v2/episode/slug/${slug}?pageSize=30&page=0&getbyOldest=false`,
    );

    const { email, password } = requireBasicAuth(req);
    const token = await (await requireAuth(email, password))
      .json() as AuthResponse;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `${token.token_type} ${token.access_token}`);

    const epiosdes = await Promise.all(
      (await baseEpiosdes).map(({ id }) =>
        request<Episode>(`/web/api/v2/episode/${id}`, { headers })
      ),
    );

    return new Response(template(await podcast, await epiosdes), {
      status: 200,
      headers: {
        "content-type": "application/rss+xml",
      },
    });
  } catch (error) {
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
          tag("lastBuildDate", new Date(episodes[0].dateAdded).toUTCString()),
          tag("itunes:image", podcast.mediumImageUrl),
          tag("itunes:owner", [
            tag("itunes:name", podcast.authorFullName),
            tag("itunes:email", "podcast@podme.com"),
          ]),
          ...episodes.map((episode) => {
            const link = `https://podme.com/no/${podcast.slug}/${episode.id}`;
            return tag("item", [
              tag("guid", link),
              tag("pubDate", new Date(episode.dateAdded).toUTCString()),
              tag("title", episode.title),
              tag("itunes:title", episode.title),
              tag("itunes:author", podcast.authorFullName),
              tag("itunes:duration", episode.length),
              tag("link", link),
              tag("description", episode.description),
              tag("enclosure", "", [
                ["url", episode.streamUrl],
                ["length", ""],
                ["type", ""],
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
