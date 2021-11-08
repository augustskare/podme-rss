import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

import { router } from "./utils.ts";
import { index } from "./routes/index.ts";
import { feed } from "./routes/feed.ts";

const PORT = "8001";
console.log(`Listening on http://localhost:${PORT}`);

const routes = new Map([
  [{ pathname: "/" }, index],
  [{ pathname: "/feed/:slug" }, feed],
]);

await listenAndServe(`:${PORT}`, (request) => router(request, routes));
