import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildMediaUrl(media?: { bucket: string; objectKey: string }) {
  if (!media || !media.objectKey) return null;
  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || `https://${media.bucket}.s3.ap-southeast-1.amazonaws.com`;
  return `${baseUrl}/${media.objectKey}`;
}
