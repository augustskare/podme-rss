import type { Podcast } from "../utils/podme.ts";
import { PageProps } from "../utils/router.tsx";

export function loader() {
  return fetch(
    "https://api.podme.com/web/api/v2/podcast/popular?podcastType=1&category=&page=0&pageSize=50",
  );
}

export default function Index(props: PageProps<Podcast[]>) {
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
          {props.data.map((podcast) => {
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
