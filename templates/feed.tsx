/** @jsx h */
import { h } from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";

import { Episode, Podcast } from "../podme.ts";

function Feed(props: { podcast: Podcast; episodes: Episode[] }) {
  return (
    <rss
      version="2.0"
      xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
    >
      <channel>
        <title>{props.podcast.title}</title>
        <description>{props.podcast.description}</description>
        <itunes:author>{props.podcast.authorFullName}</itunes:author>
        <link>{`https://podme.com/no/${props.podcast.slug}`}</link>
        <lastBuildDate>
          {new Date(props.episodes[0].publishDate).toUTCString()}
        </lastBuildDate>
        <itunes:image
          href={props.podcast.imageUrl || props.podcast.mediumImageUrl}
        >
        </itunes:image>
        <itunes:owner>
          <itunes:name>{props.podcast.authorFullName}</itunes:name>
          <itunes:email>podcast@podme.com</itunes:email>
        </itunes:owner>
        {props.episodes.map((episode) => {
          const link =
            `https://podme.com/no/${props.podcast.slug}/${episode.id}`;
          return (
            <item>
              <guid>{link}</guid>
              <pubDate>{new Date(episode.publishDate).toUTCString()}</pubDate>
              <title>{episode.title}</title>
              <itunes:title>{episode.title}</itunes:title>
              <itunes:episode>{episode.number.toString()}</itunes:episode>
              <itunes:author>{episode.authorFullName}</itunes:author>
              <itunes:subtitle>{episode.subtitle}</itunes:subtitle>
              <itunes:duration>{episode.length}</itunes:duration>
              <link>{link}</link>
              <description>{episode.description}</description>
              <enclosure
                url={episode.url}
                length={episode.byteLength.toString()}
                type={episode.type}
              >
              </enclosure>
            </item>
          );
        })}
      </channel>
    </rss>
  );
}

export default Feed;
