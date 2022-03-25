/** @jsx h */
import { h, renderSSR } from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";

import { requireAuth, requireBasicAuth, requireSubscription } from "../auth.ts";
import type { Episode, Podcast } from "../podme.ts";
import { errorHandler, request } from "../utils.ts";

import Feed from "../templates/feed.tsx";

export async function feed(pattern: URLPatternResult, req: Request) {
  const { id } = pattern.pathname.groups;
  try {
    const { email, password } = requireBasicAuth(req);
    const authResponse = await requireAuth(email, password);
    await requireSubscription(authResponse);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${Deno.env.get("ACCESS_TOKEN")}`);

    const [podcast, episodes] = await Promise.all([
      request<Podcast>(`mobile/api/v2/podcasts/${id}`, { headers }),
      request<Episode[]>(
        `mobile/api/v2/episodes/podcast/${id}`,
        { headers },
      ),
    ]);

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"? />' +
        renderSSR(<Feed podcast={podcast} episodes={episodes} />),
      {
        status: 200,
        headers: {
          "content-type": "application/rss+xml",
        },
      },
    );
  } catch (error) {
    if (error.url.includes("mobile")) {
      console.log(error.headers.get("www-authenticate"));
    }
    let status = 404;
    if (error instanceof Response) {
      status = error.status;
    }
    return errorHandler(status);
  }
}
