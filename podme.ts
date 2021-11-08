export interface AuthResponse {
  "access_token": string;
  "refresh_token": string;
  "id_token": string;
  "expires_in": number;
  "token_type": "Bearer";
}
export interface Podcast {
  authorFullName: string;
  categories: { id: number; name: string; key: string }[];
  description: string;
  id: number;
  imageUrl: string;
  isPremium: boolean;
  mediumImageUrl: string;
  slug: string;
  smallImageUrl: string;
  title: string;
}

export interface Episode {
  authorFullName: null;
  currentSpot: string;
  dateAdded: string;
  description: string;
  episodeCanBePlayed: boolean;
  id: boolean;
  imageUrl?: string;
  isPremium: boolean;
  length: string;
  mediumImageUrl: string;
  onlyAsPackageSubscription: boolean;
  podcastId: number;
  podcastTitle: string;
  slug?: string;
  smallImageUrl: string;
  streamUrl: string;
  title: string;
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
