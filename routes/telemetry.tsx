import { LoaderArgs, PageProps } from "../utils/router.tsx";

export async function loader({ context: { db } }: LoaderArgs) {
  const entries = db.list({ prefix: ["user"] });

  let users = 0;
  let avgPodcasts = 0;
  for await (const entry of entries) {
    users++;
    avgPodcasts += (entry.value as Set<string>).size;
  }
  avgPodcasts /= users;
  return { users, avgPodcasts: isNaN(avgPodcasts) ? 0 : avgPodcasts };
}

export default function Index(
  props: PageProps<{ users: number; avgPodcasts: number }>,
) {
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
        `}
        </style>
      </head>
      <body>
        <h1>Telemetry</h1>

        <dt>
          <dt>Users</dt>
          <dd>{props.data.users}</dd>
          <dt>Avg. podcast</dt>
          <dd>{props.data.avgPodcasts}</dd>
        </dt>
      </body>
    </html>
  );
}
