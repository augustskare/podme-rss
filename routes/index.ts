import type { Overview } from "../podme.ts";
import { request } from "../utils.ts";

export async function index() {
  const data = await request<Overview>(
    "https://api.podme.com/web/api/v2/podcast/popular?podcastType=1&category=&page=0&pageSize=250",
  );
  return new Response(template(data), {
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
            <img width="60" height="60" src="${item.smallImageUrl}" alt="" />
            <a href="/feed/${item.id}">${item.title}</a>
          </li>
        `)).join("")
  }
      </ul>
    </body>
  </html>`;
}
