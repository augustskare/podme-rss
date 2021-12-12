export interface Podcast {
  appImageUrl: string;
  appleId: string;
  authorFullName: string;
  authorId: string;
  benefits: string[];
  description: string;
  googleId: string;
  hasBookmark: boolean;
  hasBuyOptions: boolean;
  hasFreeOptions: boolean;
  hasSubscription: boolean;
  id: number;
  imageUrl: string;
  isFeatured: boolean;
  isInSpotlight: boolean;
  isPremium: boolean;
  mediumImageUrl: string;
  onlyAsPackageSubscription: boolean;
  onlyAsPodcastSubscription: boolean;
  preferenceDownload: boolean;
  preferenceNotification: boolean;
  slug: string;
  smallImageUrl: string;
  subscriptionType: number;
  title: string;
}

export interface Episode {
  id: number;
  podcastId: number;
  authorFullName: string;
  title: string;
  number: number;
  subtitle: string;
  podcastTitle: string;
  length: string;
  byteLength: number;
  url: string;
  type: string;
  dateAdded: string;
  description: string;
  imageUrl: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  largeImageUrl?: string;
  smoothStreamingUrl: string;
  mpegDashUrl: string;
  hlsV3Url: string;
  publishDate: string;
  hasPlayed: boolean;
  hasCompleted: boolean;
  currentSpot: string;
  episodeCreatedAt: string;
  episodeUpdatedAt: string;
  playInfoUpdatedAt: string;
  episodeCanBePlayed: boolean;
  isPremium: boolean;
  podcastImageUrl: string;
  onlyAsPackageSubscription: boolean;
}

export type PodcastOverview = {
  id: number;
  isPremium: boolean;
  largeImageUrl: string;
  mediumImageUrl: string;
  slug: string;
  smallImageUrl: string;
  title: string;
}[];
