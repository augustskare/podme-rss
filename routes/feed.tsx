import type { Episode, Podcast } from "../utils/podme.ts";
import { getPodcast } from "../utils/podme.ts";
import { authenticate, requireBasicAuth } from "../utils/auth.ts";
import { Itunes, Rss } from "../components/rss.tsx";
import { LoaderArgs, PageProps } from "../utils/router.tsx";

export async function loader({ request, params }: LoaderArgs) {
  const { username, password } = requireBasicAuth(request);
  const { access_token } = await authenticate(username, password);
  return getPodcast(params.slug, access_token);
}

export const headers = {
  "content-type": "application/rss+xml",
};

export default function Feed(
  props: PageProps<{ podcast: Podcast; episodes: Episode[] }>,
) {
  const { podcast, episodes } = props.data;
  return (
    <Rss.Root>
      <Rss.Channel>
        <title>{podcast.title}</title>
        <Rss.Description>{podcast.description}</Rss.Description>
        <Itunes.Author>{podcast.authorFullName}</Itunes.Author>
        <Rss.Link>{`https://podme.com/no/${podcast.slug}`}</Rss.Link>
        <Itunes.Date>
          {new Date(episodes[0].dateAdded).toUTCString()}
        </Itunes.Date>
        <Itunes.Image href={podcast.imageUrl || podcast.mediumImageUrl} />
        <Itunes.Owner>
          <Itunes.Name>{podcast.authorFullName}</Itunes.Name>
          <Itunes.Email>podcast@podme.com</Itunes.Email>
        </Itunes.Owner>

        {episodes.map((episode) => {
          const link = `https://podme.com/no/${podcast.slug}/${episode.id}`;
          return (
            <Rss.Item key={episode.id}>
              <Rss.Guid>{link}</Rss.Guid>
              <Rss.PubDate>
                {new Date(episode.dateAdded).toUTCString()}
              </Rss.PubDate>
              <title>{episode.title}</title>
              <Itunes.Title>{episode.title}</Itunes.Title>
              <Itunes.Author>
                {episode.authorFullName || podcast.authorFullName}
              </Itunes.Author>
              <Itunes.Duration>{episode.length}</Itunes.Duration>
              <Rss.Link>{link}</Rss.Link>
              <Rss.Description>{episode.description}</Rss.Description>
              <Rss.Enclosure
                url={episode.streamUrl.replace(
                  "master.m3u8",
                  "audio_128_pkg.mp4",
                )}
                type="audio/x-m4a"
              />
            </Rss.Item>
          );
        })}
      </Rss.Channel>
    </Rss.Root>
  );
}
