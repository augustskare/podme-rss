import type { Episode, Podcast } from "../utils/podme.ts";
import { getPodcast } from "../utils/podme.ts";
import { authenticate, requireBasicAuth } from "../utils/auth.ts";
import { Itunes, Rss } from "../components/rss.tsx";
import { LoaderArgs, PageProps } from "../utils/router.tsx";

async function hmacHash(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const hashBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hashBuffer)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function collectTelemetry(db: Deno.Kv, email: string, podcast: string) {
  const envPermission = await Deno.permissions.query({
    name: "env",
    variable: "TELEMETRY_SECRET",
  });
  const secret = envPermission.state === "granted" &&
    Deno.env.get("TELEMETRY_SECRET");
  if (typeof secret !== "string") {
    console.log("Telemetry data not collected, secret missing");
    return;
  }
  const key = ["user", await hmacHash(email, secret)];
  const value = await db.get(key);
  const podcasts = (value?.value as Set<string>) ?? new Set<string>();
  podcasts.add(podcast);
  await db.set(key, podcasts);
}

export async function loader({ request, params, context: { db } }: LoaderArgs) {
  if (params.slug === undefined) {
    return new Response("Not found", { status: 404 });
  }
  const { email, password } = requireBasicAuth(request);
  const telemetry =
    new URL(request.url).searchParams.get("telemetry") !== "false";
  if (telemetry) {
    collectTelemetry(db, email, params.slug);
  }
  const { access_token } = await authenticate(email, password);
  return getPodcast(params.slug, access_token);
}

export const headers = {
  "content-type": "application/rss+xml",
};

export default function Feed(
  props: PageProps<{ podcast: Podcast; episodes: Episode[] }>,
) {
  const { podcast, episodes } = props.data;
  const image = podcast.imageUrl || podcast.mediumImageUrl ||
    podcast.smallImageUrl;

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
        <Itunes.Image href={image} />
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
              <Rss.Enclosure url={episode.url} type="audio/mpeg" />
            </Rss.Item>
          );
        })}
      </Rss.Channel>
    </Rss.Root>
  );
}
