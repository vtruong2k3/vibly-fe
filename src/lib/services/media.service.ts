import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

export interface CreatePresignedUrlDto {
  mediaType: MediaType;
  mimeType: string;
  originalFilename: string;
  sizeBytes?: number;
}

// Backend returns: { success: true, data: { mediaAssetId, presignedUrl, objectKey, expiresIn } }
// The axios interceptor unwraps the envelope, so we type the inner object.
export interface PresignedUrlResponse {
  mediaAssetId: string;
  presignedUrl: string;
  objectKey: string;
  expiresIn: number;
}

// ─── Media Service ────────────────────────────────────────────────────────────
export const mediaService = {
  /** Step 1: Get S3 presigned URL from backend */
  getPresignedUrl: (dto: CreatePresignedUrlDto) =>
    apiClient
      .post<{ success: boolean; data: PresignedUrlResponse }>(ENDPOINTS.media.presignedUrl, dto)
      .then((r) => r.data.data),

  /** Step 2: Upload file directly to S3 using the presigned URL (native fetch, NOT apiClient) */
  uploadToS3: async (presignedUrl: string, file: File) => {
    const res = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
  },

  /** Step 3: Confirm upload success to backend */
  confirmUpload: (mediaAssetId: string) =>
    apiClient.patch(ENDPOINTS.media.confirm(mediaAssetId)).then((r) => r.data),

  /**
   * Full 3-step upload flow.
   * Returns the confirmed mediaAssetId to pass into createPost({ mediaIds }).
   */
  upload: async (file: File, mediaType: MediaType): Promise<string> => {
    const { mediaAssetId, presignedUrl } = await mediaService.getPresignedUrl({
      mediaType,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
    });
    await mediaService.uploadToS3(presignedUrl, file);
    await mediaService.confirmUpload(mediaAssetId);
    return mediaAssetId;
  },

  getById: (id: string) =>
    apiClient.get(ENDPOINTS.media.byId(id)).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.media.delete(id)).then((r) => r.data),
};
