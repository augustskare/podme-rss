/** @jsx h */
import { h } from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";

import type { PodcastOverview } from "../podme.ts";

function Overview(props: { data: PodcastOverview }) {
  return (
    <html lang="nb-NO">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Podme</title>
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {props.data.map((item) => {
            return (
              <li
                key={item.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBlockEnd: "1rem",
                }}
              >
                <img width="60" height="60" src={item.smallImageUrl} alt="" />
                <a href={`/feed/${item.id}`}>{item.title}</a>
              </li>
            );
          })}
        </ul>
      </body>
    </html>
  );
}

export default Overview;
