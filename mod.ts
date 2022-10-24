import { serve } from "https://deno.land/std@0.159.0/http/server.ts";

import { router } from "./utils/router.ts";
import { index } from "./routes/index.ts";
import { feed } from "./routes/feed.ts";

const routes = new Map([
  [{ pathname: "/" }, index],
  [{ pathname: "/:slug" }, feed],
]);

await serve((request) => router(request, routes));
