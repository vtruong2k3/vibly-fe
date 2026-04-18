"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  isSubmitting?: boolean;
  serverError?: string | null;
  onConfirm: (reason: string) => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmWithReasonDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  requireReason = true,
  isSubmitting: externalSubmitting = false,
  serverError,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = isPending || externalSubmitting;
  const displayError = serverError ?? localError;

  if (!open) return null;

  const canSubmit = !requireReason || reason.trim().length >= 10;

  const handleConfirm = async () => {
    if (!canSubmit) {
      setLocalError("Reason must be at least 10 characters.");
      return;
    }
    setIsPending(true);
    setLocalError(null);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch {
      setLocalError("Action failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D1526] border border-white/10 shadow-2xl">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {destructive && (
              <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                <AlertTriangle className="size-4 text-red-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 p-1 text-slate-600 hover:text-slate-300 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Reason textarea */}
          {requireReason && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                id="confirm-reason"
                rows={3}
                placeholder="Enter a reason for this action (min. 10 characters)…"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setLocalError(null); }}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
              />
              <p className="text-xs text-slate-600 text-right">
                {reason.trim().length}/10 min
              </p>
            </div>
          )}

          {displayError && (
            <p role="alert" className="text-xs text-red-400">{displayError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-action-btn"
              onClick={handleConfirm}
              disabled={isLoading || !canSubmit}
              className={cn(
                "flex-1 h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                destructive
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white",
              )}
            >
              {isLoading ? "Processing…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
