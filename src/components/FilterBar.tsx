import styles from "./FilterBar.module.css";

import RangeSlider from "@/components/RangeSlider";

import {formatCount, formatMinutes} from "@/lib/format";

import type {FilterBounds, FilterState, Range, SortKey} from "@/types";

interface FilterBarProps {
  filters: FilterState;
  bounds: FilterBounds;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onRandom: () => void;
  onReset: () => void;
}

export default function FilterBar({filters, bounds, resultCount, onChange, onRandom, onReset}: FilterBarProps) {
  const durationValue = filters.duration ?? bounds.duration;
  const viewsValue = filters.views ?? bounds.views;
  const yearValue = filters.year ?? bounds.year;

  const SORT_OPTIONS: {value: SortKey; label: string}[] = [
    {value: "newest", label: "Newest first"},
    {value: "oldest", label: "Oldest first"},
    {value: "views", label: "Most viewed"},
    {value: "views_asc", label: "Least viewed"},
    {value: "likes", label: "Most liked"},
    {value: "duration", label: "Longest"},
    {value: "duration_asc", label: "Shortest"},
    {value: "title", label: "Title A–Z"}
  ];

  const checkSameRange = (a: Range, b: Range) => {
    return a[0] === b[0] && a[1] === b[1];
  }

  const setDuration = (next: Range) => {
    onChange({duration: checkSameRange(next, bounds.duration) ? null : next});
  }

  const setViews = (next: Range) => {
    onChange({views: checkSameRange(next, bounds.views) ? null : next});
  }

  const setYear = (next: Range) => {
    onChange({year: checkSameRange(next, bounds.year) ? null : next});
  }

  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <input className={styles.search} onChange={(e) => onChange({query: e.target.value})} placeholder="Search titles…" type="search" value={filters.query}/>
        <select className={styles.select} onChange={(e) => onChange({sortBy: e.target.value as SortKey})} value={filters.sortBy}>{SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <button className={styles.reset} onClick={onReset} type="button">Reset</button>
        <button className={styles.random} disabled={resultCount === 0} onClick={onRandom} type="button">View random video from filter</button>
      </div>
      <div className={styles.sliders}>
        <RangeSlider format={formatMinutes} label="Length" max={bounds.duration[1]} min={bounds.duration[0]} onChange={setDuration} value={durationValue}/>
        <RangeSlider format={formatCount} label="Views" max={bounds.views[1]} min={bounds.views[0]} onChange={setViews} value={viewsValue}/>
        <RangeSlider format={(n) => n.toString()} label="Year" max={bounds.year[1]} min={bounds.year[0]} onChange={setYear} value={yearValue}/>
      </div>
      <div className={styles.count}>{resultCount} {resultCount === 1 ? "video" : "videos"}</div>
    </div>
  );
}
