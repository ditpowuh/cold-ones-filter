export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  uploadDate: string | null;
  timestamp: number | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
}

export interface VideosPayload {
  videoCount: number;
  fetchedAt: string;
  videos: Video[];
}

export type SortKey = "newest" | "oldest" | "views" | "views_asc" | "likes" | "duration" | "duration_asc" | "title";

export type Range = [number, number];

export interface FilterBounds {
  duration: Range;
  views: Range;
  year: Range;
}

export interface FilterState {
  query: string;
  sortBy: SortKey;
  duration: Range | null;
  views: Range | null;
  year: Range | null;
}
