import { Loader2 } from "lucide-react";

type ProcessingStateProps = {
  message: string;
};

export function ProcessingState({ message }: ProcessingStateProps) {
  return (
    <p className="flex items-center gap-2 text-sm font-bold text-stone-600">
      <Loader2 className="animate-spin" size={16} aria-hidden="true" />
      {message}
    </p>
  );
}
