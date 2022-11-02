import type { Podcast } from "../utils/podme.ts";
import { PageProps } from "../utils/router.tsx";

export function loader() {
  return fetch(
    "https://api.podme.com/web/api/v2/podcast/popular?podcastType=1&category=&page=0&pageSize=50",
  );
}

export default function Index(props: PageProps<Podcast[]>) {
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
              accent-color: red;
            }
            label {
              display: block;
              margin-block-end: .25rem;
            }

            input {
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
        <h1>Generer podcast url</h1>

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
            <input
              type="podcast"
              name="podcast"
              id="podcast"
              list="podcast-list"
            />
            <datalist id="podcast-list">
              {props.data.map((podcast) => (
                <option key={podcast.slug} value={podcast.slug}>
                  {podcast.title}
                </option>
              ))}
            </datalist>
          </p>

          <button>Generer url</button>
        </form>
      </body>
    </html>
  );
}
