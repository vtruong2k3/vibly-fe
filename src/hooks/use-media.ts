"use client";

import { useState } from "react";
import { mediaService, type MediaType } from "@/lib/services/media.service";

export interface MediaFile {
  file: File;
  previewUrl: string;        // object URL for local preview
  mediaType: MediaType;
}

/**
 * Determines the MediaType from a File's MIME type.
 */
function getMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type.startsWith("audio/")) return "AUDIO";
  return "FILE";
}

/**
 * useMediaFiles — manages local file selection and previews.
 * Separate from the upload mutation so the component can preview before posting.
 */
export function useMediaFiles(maxFiles = 10) {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const remaining = maxFiles - files.length;
    const toAdd = arr.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      mediaType: getMediaType(file),
    }));
    setFiles((prev) => [...prev, ...toAdd]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  const clearFiles = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  };

  return { files, addFiles, removeFile, clearFiles };
}

/**
 * Uploads all selected files concurrently and returns their mediaAssetIds.
 * Throws if any single upload fails (all-or-nothing).
 */
export async function uploadFiles(mediaFiles: MediaFile[]): Promise<string[]> {
  return Promise.all(
    mediaFiles.map((mf) => mediaService.upload(mf.file, mf.mediaType))
  );
}
