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
  categories: {id: number, name: string; key: string;}[];
  subscriptionType: number
  smallImageUrl: string;
  mediumImageUrl: string;
}

export interface Episode {
  id: number;
  podcastId: number;
  authorFullName: string | null;
  title: string;
  podcastTitle: string | null;
  length: string; //"01:01:35",
  description: string;
  imageUrl?: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  streamUrl: string;
  slug: string | null,
  currentSpot: string; //"00:00:00",
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
