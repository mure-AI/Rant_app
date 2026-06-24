type EmotionBadgeProps = {
  emotion: string;
};

export function EmotionBadge({ emotion }: EmotionBadgeProps) {
  return <span className="rounded-full bg-clay/10 px-3 py-1 text-sm font-black text-clay">{emotion}</span>;
}
