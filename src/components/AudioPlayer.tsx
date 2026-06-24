type AudioPlayerProps = {
  src: string;
};

export function AudioPlayer({ src }: AudioPlayerProps) {
  if (!src) {
    return null;
  }

  return (
    <audio className="w-full" controls src={src}>
      <track kind="captions" />
    </audio>
  );
}
