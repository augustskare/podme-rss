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
        thead tr {
          text-align: left;
        }
        td, th {
          padding-block: .25rem;
        }
        td {
          border-bottom: 1px solid;
        }
        td:not(:first-of-type), th:last-of-type {
          padding-inline: .5rem;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
        }
      </style>
    </head>
    <body>
    <table>
      <thead>
        <tr>
          <th colspan="2">Podcast</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        ${
    data.map((item) => (`
          <tr>
            <td><img width="60" height="60" src="${item.smallImageUrl}" alt="" /></td>
            <td><a href="/feed/${item.id}">${item.title}</a></td>
            <td>${item.id}</td>
          </tr>
        `)).join("")
  }
      </tbody>
    </table>
    </body>
  </html>`;
}
