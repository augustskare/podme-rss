import type { Overview } from "../utils/podme.ts";
import { getOverview } from "../utils/podme.ts";

export async function index() {
  return new Response(template(await getOverview()), {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}

function template(data: Overview) {
  return `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Podme</title>
      <style>
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
      </style>
    </head>
    <body>
      <ul>  
        ${
    data.map((item) => (`
          <li>
            <img width="60" height="60" src="${item.smallImageUrl}" alt="" loading="lazy" />
            <a href="/${item.slug}">${item.title}</a>
          </li>
        `)).join("")
  }
      </ul>
    </body>
  </html>`;
}
