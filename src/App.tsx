import styles from "./App.module.css";
import {useEffect, useMemo, useState} from "react";
import {motion, MotionConfig} from "motion/react";

import FilterBar from "@/components/FilterBar";
import VideoCard from "@/components/VideoCard";

import {DEFAULT_FILTERS} from "@/lib/filter";

import type {FilterBounds, FilterState, Video, VideosPayload} from "@/types";

export default function App() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const videoDateValue = (video: Video): number => {
    if (video.timestamp != null) {
      return video.timestamp;
    }
    if (video.uploadDate) {
      const y = Number(video.uploadDate.slice(0, 4));
      const m = Number(video.uploadDate.slice(4, 6));
      const d = Number(video.uploadDate.slice(6, 8));
      return Date.UTC(y, m - 1, d) / 1000;
    }
    return 0;
  }

  const COMPARATORS: Record<FilterState["sortBy"], (a: Video, b: Video) => number> = {
    newest: (a, b) => videoDateValue(b) - videoDateValue(a),
    oldest: (a, b) => videoDateValue(a) - videoDateValue(b),
    views: (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0),
    views_asc: (a, b) => (a.viewCount ?? 0) - (b.viewCount ?? 0),
    likes: (a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0),
    duration: (a, b) => (b.duration ?? 0) - (a.duration ?? 0),
    duration_asc: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
    title: (a, b) => a.title.localeCompare(b.title)
  };

  const bounds = useMemo<FilterBounds | null>(() => {
    if (!videos || videos.length === 0) {
      return null;
    }

    let minDuration = Infinity;
    let maxDuration = -Infinity;
    let minViews = Infinity;
    let maxViews = -Infinity;
    let minYear = Infinity;
    let maxYear = -Infinity;

    for (const video of videos) {
      const duration = video.duration ?? 0;

      minDuration = Math.min(minDuration, duration);
      maxDuration = Math.max(maxDuration, duration);

      const views = video.viewCount ?? 0;

      minViews = Math.min(minViews, views);
      maxViews = Math.max(maxViews, views);

      if (video.uploadDate) {
        const year = Number(video.uploadDate.slice(0, 4));
        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
      }
    }
    if (!Number.isFinite(minYear)) {
      minYear = new Date().getFullYear();
      maxYear = minYear;
    }
    return {
      duration: [minDuration, maxDuration],
      views: [minViews, maxViews],
      year: [minYear, maxYear]
    };
  }, [videos]);

  const filtered = useMemo(() => {
    if (!videos) {
      return [];
    }
    const query = filters.query.trim().toLowerCase();

    const list = videos.filter((video) => {
      if (query && !video.title.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.duration) {
        const duration = video.duration ?? 0;
        if (duration < filters.duration[0] || duration > filters.duration[1]) {
          return false;
        }
      }
      if (filters.views) {
        const views = video.viewCount ?? 0;
        if (views < filters.views[0] || views > filters.views[1]) {
          return false;
        }
      }
      if (filters.year) {
        const year = video.uploadDate ? Number(video.uploadDate.slice(0, 4)) : null;
        if (year == null || year < filters.year[0] || year > filters.year[1]) {
          return false;
        }
      }
      return true;
    });

    list.sort(COMPARATORS[filters.sortBy]);
    return list;
  }, [videos, filters]);

  const updateFilter = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({...prev, ...patch}));
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  }

  const openRandomVideo = () => {
    if (filtered.length === 0) {
      return;
    }
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    window.open(pick.url, "_blank");
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/videos.json").then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json() as Promise<VideosPayload>;
    }).then((data) => {
      if (!cancelled) {
        setVideos(data.videos);
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setError(error instanceof Error ? error.message : String(error));
      }
    });

    return () => {
      cancelled = true;
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.app}>
        <header className={styles.header}>
          <div>Every Cold Ones Video That's Not A Podcast Episode</div>
        </header>
        {bounds && (
          <div className={styles.stickybar}>
            <div className={styles.barinner}>
              <FilterBar bounds={bounds} filters={filters} onChange={updateFilter} onRandom={openRandomVideo} onReset={resetFilters} resultCount={filtered.length}/>
            </div>
          </div>
        )}
        <main className={styles.main}>
          {error && (
            <p className={styles.message}>Failed to load videos: {error}</p>
          )}
          {(!error && !videos) && (
            <p className={styles.message}>Loading...</p>
          )}
          {(videos && !error && filtered.length === 0) && (
            <p className={styles.message}>No videos match these filters.</p>
          )}
          <motion.div animate="show" className={styles.grid} initial="hidden" variants={{hidden: {}, show: {transition: {staggerChildren: 0.03}}}}>
            {filtered.map((video) => <VideoCard key={video.id} video={video}/>)}
          </motion.div>
        </main>
        <footer className={styles.end}>
          <div>Not affiliated with Cold Ones.</div>
          <div>Big thanks to this <a href="https://www.youtube.com/playlist?list=PLk4cmie-EXn-8DKpwUk6sxKxpH4PUbybn" target="_blank" rel="noopener noreferrer">YouTube playlist</a>.</div>
          <div>Created by <a href="https://www.ditpowuh.com/" target="_blank" rel="noopener noreferrer">Ditpowuh</a>.</div>
        </footer>
      </div>
    </MotionConfig>
  );
}
