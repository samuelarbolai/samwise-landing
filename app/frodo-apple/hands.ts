export type Beat = {
  id: "s1" | "s2" | "s3" | "s4" | "s5";
  /** Lucide icon name. */
  icon: "HandHelping" | "Handshake" | "HeartHandshake" | "HandGrab" | "Hand";
  /** CSS rotation in deg. */
  rotate?: number;
  /** The hero phrase shown in the copy column for this beat. */
  hero: string;
  /** Whether to show the dark void mark accompanying this beat. */
  showVoid?: boolean;
  /** Whether to show the luminous star accompanying this beat. */
  showStar?: boolean;
};

export const BEATS: Beat[] = [
  { id: "s1", icon: "HandHelping", rotate: 180, hero: "A definitive solution.", showVoid: true },
  { id: "s2", icon: "Handshake", hero: "Held." },
  { id: "s3", icon: "HeartHandshake", hero: "Begin." },
  { id: "s4", icon: "HandGrab", hero: "Caught.", showVoid: true },
  { id: "s5", icon: "Hand", hero: "You can rest.", showStar: true },
];
