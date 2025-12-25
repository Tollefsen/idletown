export type Song = {
  title: string;
  lyrics: string;
};

export type Songbook = Song[];

export type StoredPamphlet = {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
  updatedAt: number;
};
