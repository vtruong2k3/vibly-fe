import { Inbox } from "lucide-react";

interface Props { message?: string }

export default function AdminEmptyState({ message = "No data found." }: Props) {
  return (
    <div className="rounded-xl border border-white/5 px-5 py-12 text-center space-y-2">
      <Inbox className="size-6 text-slate-600 mx-auto" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
