import { Skeleton } from "../../components/ui/skeleton";
import type { OpenverseImageResult } from "../../lib/openverseApi";

interface MasonryGalleryProps {
  images: OpenverseImageResult[];
  loading: boolean;
  onImageClick: (img: OpenverseImageResult) => void;
}

export default function MasonryGallery({
  images,
  loading,
  onImageClick,
}: MasonryGalleryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton
            key={i}
            className="w-full h-48 rounded-xl bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="py-12 text-center text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <p className="text-lg">No results found.</p>
        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((img) => (
        <div
          key={img.id}
          className="rounded-xl overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900 hover:shadow-2xl hover:-translate-y-[2px] transition-all duration-300 cursor-pointer group"
          onClick={() => onImageClick(img)}
        >
          <img
            src={img.thumbnail || img.url}
            alt={img.title || "Untitled"}
            className="w-full h-48 object-cover group-hover:brightness-110 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
          />
          <div className="p-2 pb-1 text-xs text-zinc-300 truncate">
            {img.title || "Untitled"}
          </div>
        </div>
      ))}
    </div>
  );
}
