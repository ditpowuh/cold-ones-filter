import styles from "./VideoCard.module.css";

import {motion} from "motion/react";

import {formatCount, formatDate, formatDuration} from "@/lib/format";

import type {Variants} from "motion/react";
import type {Video} from "@/types";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({video}: VideoCardProps) {
  const duration = formatDuration(video.duration);
  const views = formatCount(video.viewCount);
  const date = formatDate(video.uploadDate);

  const cardVariants: Variants = {
    hidden: {opacity: 0, y: 16},
    show: {opacity: 1, y: 0, transition: {duration: 0.35, ease: "easeOut"}}
  };

  return (
    <motion.a animate="show" className={styles.card} href={video.url} initial="hidden" rel="noreferrer" target="_blank" variants={cardVariants}>
      <div className={styles.thumbwrap}>
        {video.thumbnail && (
          <img className={styles.thumb} src={video.thumbnail} alt="" loading="lazy"/>
        )}
        {duration && (
          <span className={styles.duration}>{duration}</span>
        )}
      </div>
      <div className={styles.meta}>
        <h2 className={styles.title}>{video.title}</h2>
        <div className={styles.stats}>
          {views && (
            <span>{views} views</span>
          )}
          {(views && date) && (
            <span className={styles.dot}>•</span>
          )}
          {date && (
            <span>{date}</span>
          )}
        </div>
      </div>
    </motion.a>
  );
}
