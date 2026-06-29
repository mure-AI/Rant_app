type EmotionBadgeProps = {
  emotion: string;
};

export function EmotionBadge({ emotion }: EmotionBadgeProps) {
  return <span className="rounded-md border border-line bg-white px-3 py-1 text-sm font-semibold text-maroon">{emotion}</span>;
}
