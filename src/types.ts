export type GameLocation = {
  id: string;
  name: string;
  country: string;
  description: string;
  cuisine: string;
  image: string;
  souvenirs: string[];
};

export type ChatMessage = {
  id: string;
  author: 'player' | 'guide' | 'system';
  text: string;
  timestamp: string;
};

export type PlayerProfile = {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  locationId: string;
  visitedLocationIds: string[];
  souvenirs: string[];
  updatedAt: number;
};
