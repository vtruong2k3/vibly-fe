import Image from "next/image";

export function ProfilePhotosCard() {
  // Figma extracted local assets specifically for the Sidebar
  const photoUrls = [
    "/images/mock-media/media-1-56586a.png",
    "/images/mock-media/media-2-56586a.png",
    "/images/mock-media/media-3-56586a.png",
    "/images/mock-media/media-4-56586a.png",
    "/images/mock-media/media-5-56586a.png",
    "/images/mock-media/media-6-56586a.png",
  ];

  return (
    <div className="bg-card rounded-[32px] p-6 border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-foreground">Photos</h3>
        <button className="text-[14px] font-semibold text-primary hover:underline">
          See all
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {photoUrls.map((url, i) => (
          <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-muted">
            <Image
              src={url}
              alt={`Gallery preview ${i}`}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 33vw, 100px"
              unoptimized // Mock local media shouldn't enforce Vercel optimization
            />
          </div>
        ))}
      </div>
    </div>
  );
}
