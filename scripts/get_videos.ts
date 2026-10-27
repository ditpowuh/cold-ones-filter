import {YtDlp} from "ytdlp-nodejs";

import fs from "fs";
import path from "path";

const PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLk4cmie-EXn-8DKpwUk6sxKxpH4PUbybn";
const OUTPUT_PATH = path.resolve("./public/videos.json");
const DEFAULT_YTDLP_PATH = "./binaries/yt-dlp.exe";
const CONCURRENCY = 8;

const ytDlpPath = path.resolve(process.argv[2] ?? DEFAULT_YTDLP_PATH);

if (!fs.existsSync(ytDlpPath)) {
  console.error(`yt-dlp binary not found at: ${ytDlpPath}`);
  console.error("Pass the path as the first argument, e.g. npm run data -- ./binaries/yt-dlp.exe");
  process.exit(1);
}

const ytdlp = new YtDlp({
  binaryPath: ytDlpPath
});

interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

interface FlatEntry {
  id: string;
  title: string;
  duration: number | null;
  view_count: number | null;
  url: string;
  thumbnails: Thumbnail[];
}

interface Video {
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

async function fetchVideoDetails(flat: FlatEntry): Promise<Video> {
  const base: Video = {
    id: flat.id,
    title: flat.title,
    url: flat.url,
    thumbnail: flat.thumbnails.at(-1)?.url ?? null,
    duration: flat.duration,
    uploadDate: null,
    timestamp: null,
    viewCount: flat.view_count,
    likeCount: null,
    commentCount: null
  };

  try {
    const info = await ytdlp.getInfoAsync(flat.url);
    return {
      ...base,
      title: info.title || base.title,
      url: info.webpage_url || base.url,
      thumbnail: info.thumbnail || base.thumbnail,
      duration: info.duration ?? base.duration,
      uploadDate: (info as {upload_date?: string | null}).upload_date ?? null,
      timestamp: (info as {timestamp?: number | null}).timestamp ?? null,
      viewCount: info.view_count ?? base.viewCount,
      likeCount: (info as {like_count?: number | null}).like_count ?? null,
      commentCount: (info as {comment_count?: number | null}).comment_count ?? null
    };
  }
  catch {
    return base;
  }
}

async function fetchAllVideos(flatEntries: FlatEntry[]): Promise<Video[]> {
  const videos = new Array<Video>(flatEntries.length);
  let nextIndex = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;
      const flat = flatEntries[index];
      if (!flat) {
        return;
      }
      videos[index] = await fetchVideoDetails(flat);
      if (!videos[index].uploadDate) {
        failed++;
      }
    }
  }

  await Promise.all(Array.from({length: CONCURRENCY}, worker));
  console.log(`\nResults: ${videos.length - failed} detailed, ${failed} age-restricted/fallback\n`);
  return videos;
}

async function main() {
  console.log("Fetching playlist (flat, for ordered video list)...");
  const flatInfo = await ytdlp.getInfoAsync(PLAYLIST_URL);
  const flatEntries = (flatInfo.entries ?? []) as unknown as FlatEntry[];
  console.log(`Found ${flatEntries.length} entries!`);

  console.log("Fetching details for each video...");
  const videos = await fetchAllVideos(flatEntries);

  const payload = {
    videoCount: videos.length,
    fetchedAt: new Date().toISOString(),
    videos
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), {recursive: true});
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${videos.length} videos to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
