import { AlertCircle } from "lucide-react";

interface Props { onRetry: () => void }

export default function AdminErrorState({ onRetry }: Props) {
  return (
    <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-10 text-center space-y-3">
      <AlertCircle className="size-6 text-red-400 mx-auto" />
      <p className="text-sm text-red-400 font-medium">Failed to load data</p>
      <p className="text-xs text-red-400/60">Check your connection or try again.</p>
      <button
        onClick={onRetry}
        className="mt-1 px-4 h-8 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
