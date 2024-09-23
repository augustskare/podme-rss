import { LoaderArgs, PageProps } from "../utils/router.tsx";

const Region = {
  "SE": "1",
  "NO": "2",
  "FI": "3",
};

const cache = await caches.open("podme-rss");

function getCurrentRegion(url: URL) {
  const requestedRegion = url.searchParams.get("region") || "";
  return (Object.keys(Region).includes(requestedRegion)
    ? requestedRegion
    : "NO") as keyof typeof Region;
}

export async function loader({ request }: LoaderArgs) {
  const region = getCurrentRegion(new URL(request.url));

  const url = new URL("https://api.podme.com/web/api/v2/podcast/category/222");
  url.searchParams.set("page", "0");
  url.searchParams.set("pageSize", "150");
  url.searchParams.set("region", Region[region]);

  const cacheKey = url.toString();
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  if (response.ok) {
    await cache.put(
      cacheKey,
      new Response(response.clone().body, {
        status: 200,
        headers: {
          "Cache-Control": "max-age=3600",
          "Content-Type": "application/json",
        },
      }),
    );
    return response;
  }
  throw response;
}

export default function Index(
  props: PageProps<{
    total: number;
    podcasts: { slug: string; title: string; id: string }[];
  }>,
) {
  const region = getCurrentRegion(props.url);
  const email = props.url.searchParams.get("email");
  const password = props.url.searchParams.get("password");
  const podcast = props.url.searchParams.get("podcast");

  let feedUrl: string | undefined;
  if (email && password && podcast) {
    const url = new URL(podcast, props.url.origin);
    url.password = password;
    url.username = email;
    feedUrl = url.toString();
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>podme-rss</title>
        <style>
          {`
            body {
              font-family: system-ui, sans-serif;
            }
            label {
              display: block;
              margin-block-end: .25rem;
            }

            input, select {
              font-size: 1em;
              border: 1px solid gray;
              border-radius: .25rem;
              padding: .25rem;
            }


            output {
              background-color: khaki;
              padding: .5rem .75rem;
              border-radius: .25rem;
            }
            button {
              font-size: 1em;
            }
        `}
        </style>
      </head>
      <body>
        <h1>Generate podcast url</h1>

        <nav>
          <h2>Selected region</h2>
          <ul>
            <li>
              <a
                href="?region=NO"
                aria-current={region === "NO" ? "page" : undefined}
              >
                Norway
              </a>
            </li>
            <li>
              <a
                href="?region=SE"
                aria-current={region === "SE" ? "page" : undefined}
              >
                Sweden
              </a>
            </li>
            <li>
              <a
                href="?region=FI"
                aria-current={region === "FI" ? "page" : undefined}
              >
                Finland
              </a>
            </li>
          </ul>
        </nav>

        {feedUrl
          ? (
            <output form="form" for="email password podcast">
              <a href={feedUrl}>{feedUrl}</a>
            </output>
          )
          : null}
        <form id="form">
          <p>
            <label htmlFor="email">E-post</label>
            <input type="email" name="email" id="email" />
          </p>
          <p>
            <label htmlFor="password">Passord</label>
            <input type="password" name="password" id="password" />
          </p>
          <p>
            <label htmlFor="podcast">Podcast</label>
            <select name="podcast" id="podcast">
              {props.data.podcasts.map((podcast) => (
                <option key={podcast.slug} value={podcast.slug}>
                  {podcast.title}
                </option>
              ))}
            </select>
          </p>

          <button>Generate url</button>
        </form>
      </body>
    </html>
  );
}
