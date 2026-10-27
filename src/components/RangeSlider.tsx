import styles from "./RangeSlider.module.css";

import type {Range} from "@/types";

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: Range;
  format: (n: number) => string;
  onChange: (value: Range) => void;
}

export default function RangeSlider({label, min, max, value, format, onChange}: RangeSliderProps) {
  const clamp = (n: number) => {
    return Math.min(max, Math.max(min, n));
  }

  function setLow(next: number) {
    onChange([Math.min(clamp(next), high), high]);
  }

  function setHigh(next: number) {
    onChange([low, Math.max(clamp(next), low)]);
  }

  const span = max - min || 1;

  const low = clamp(value[0]);
  const high = clamp(value[1]);

  const lowPct = ((low - min) / span) * 100;
  const highPct = ((high - min) / span) * 100;

  const midpoint = (min + max) / 2;

  return (
    <div className={styles.slider}>
      <div className={styles.sliderhead}>
        <span className={styles.sliderlabel}>{label}</span>
        <span className={styles.slidervalue}>{format(low)} – {format(high)}</span>
      </div>
      <div className={styles.trackwrap}>
        <div className={styles.track}/>
        <div className={styles.fill} style={{left: `${lowPct}%`, width: `${highPct - lowPct}%`}}/>
        <input aria-label={`${label} minimum`} className={styles.rangeinput} max={max} min={min} onChange={(e) => setLow(Number(e.target.value))} style={{zIndex: low > midpoint ? 3 : 1}} type="range" value={low}/>
        <input aria-label={`${label} maximum`} className={styles.rangeinput} max={max} min={min} onChange={(e) => setHigh(Number(e.target.value))} style={{zIndex: high > midpoint ? 3 : 1}} type="range" value={high}/>
      </div>
    </div>
  );
}
