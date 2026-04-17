import Image from "next/image";
import { buildMediaUrl } from "@/lib/utils";

interface ProfilePhotosCardProps {
  photos: any[];
}

export function ProfilePhotosCard({ photos = [] }: ProfilePhotosCardProps) {
  // Figma extracted local assets specifically for the Sidebar
  const fallbackPhotos = [
    "/images/mock-media/media-1-56586a.png",
    "/images/mock-media/media-2-56586a.png",
    "/images/mock-media/media-3-56586a.png",
    "/images/mock-media/media-4-56586a.png",
    "/images/mock-media/media-5-56586a.png",
    "/images/mock-media/media-6-56586a.png",
  ];

  const displayPhotos = photos.length > 0 ? photos.slice(0, 6) : fallbackPhotos;

  return (
    <div className="bg-card rounded-[32px] p-6 border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-foreground">Photos</h3>
        <button className="text-[14px] font-semibold text-primary hover:underline">
          See all
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {displayPhotos.map((photo, i) => {
          const isMock = typeof photo === 'string';
          const src = isMock ? photo : buildMediaUrl(photo.mediaAsset);
          if (!src) return null;
          
          return (
            <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-muted">
              <Image
                src={src}
                alt={`Gallery preview ${i}`}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 768px) 33vw, 100px"
                unoptimized={isMock} // Mock local media shouldn't enforce Vercel optimization
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
