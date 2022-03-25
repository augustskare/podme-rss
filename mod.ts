import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

import { router } from "./utils.ts";
import { index } from "./routes/index.tsx";
import { feed } from "./routes/feed.tsx";

const PORT = "8001";
console.log(`Listening on http://localhost:${PORT}`);

const routes = new Map([
  [{ pathname: "/" }, index],
  [{ pathname: "/feed/:id" }, feed],
]);

await listenAndServe(`:${PORT}`, (request) => router(request, routes));
