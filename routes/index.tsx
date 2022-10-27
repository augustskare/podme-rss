import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.6?target=deno";

import type { Overview } from "../utils/podme.ts";
import { getOverview } from "../utils/podme.ts";

export async function index() {
  const html = renderToString(<Index podcasts={await getOverview()} />);

  return new Response(`<!DOCTYPE html>${html}`, {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}

function Index(props: { podcasts: Overview }) {
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
        ul {
          padding: 0;
          margin: 0;
          list-style: none;
        }
        li {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-block-end: 1rem;
        }
        `}
        </style>
      </head>
      <body>
        <ul>
          {props.podcasts.map((podcast) => {
            return (
              <li key={podcast.slug}>
                <img
                  width="60"
                  height="60"
                  src={podcast.smallImageUrl}
                  alt=""
                  loading="lazy"
                />
                <a href={podcast.slug}>{podcast.title}</a>
              </li>
            );
          })}
        </ul>
      </body>
    </html>
  );
}
