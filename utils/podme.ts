async function $fetch<ReqResponse>(
  path: string,
  options?: RequestInit,
): Promise<ReqResponse> {
  const url = new URL(path, "https://api.podme.com/");

  const response = await fetch(url, options);
  if (response.ok) {
    return response.json();
  }
  throw response;
}

export async function getPodcast(slug: string, access_token: string) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${access_token}`);

  const [podcast, episodes] = await Promise.all([
    $fetch<Podcast>(`/web/api/v2/podcast/slug/${slug}`, { headers }),
    $fetch<Episode[]>(`/web/api/v2/episode/slug/${slug}`, { headers }),
  ]);

  return {
    podcast,
    episodes,
  };
}

export function getSubscription(access_token: string) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${access_token}`);

  return $fetch("/web/api/v2/subscription", { headers });
}

export function getOverview() {
  return $fetch<Overview>(
    "/web/api/v2/podcast/popular?podcastType=1&category=&page=0&pageSize=250",
  );
}
export interface Podcast {
  id: number;
  title: string;
  slug: string;
  description: string;
  isPremium: boolean;
  imageUrl: string;
  authorFullName: string;
  hasBookmark: boolean | null;
  hasSubscription: boolean | null;
  categories: { id: number; name: string; key: string }[];
  subscriptionType: number;
  smallImageUrl: string;
  mediumImageUrl: string;
}

export interface Episode {
  id: number;
  podcastId: number;
  authorFullName: string | null;
  title: string;
  podcastTitle: string | null;
  length: string;
  description: string;
  imageUrl?: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  streamUrl: string;
  slug: string | null;
  currentSpot: string;
  dateAdded: string;
  isPremium: boolean;
  episodeCanBePlayed: boolean;
  onlyAsPackageSubscription: boolean;
}

export type Overview = {
  id: number;
  isPremium: boolean;
  largeImageUrl: string;
  mediumImageUrl: string;
  slug: string;
  smallImageUrl: string;
  title: string;
}[];
