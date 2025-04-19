import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  OpenverseImageResult,
  OpenverseAudioResult,
} from "@/lib/openverseApi";
import { OpenverseApi } from "@/lib/openverseApi";
import MasonryGallery from "@/features/search/MasonryGallery";
import AudioGallery from "@/features/search/AudioGallery";

interface MediaDetailModalProps {
  media: OpenverseImageResult | OpenverseAudioResult | null;
  isOpen: boolean;
  onClose: () => void;
  onImageClick: (img: OpenverseImageResult) => void;
}

const api = new OpenverseApi();

export default function MediaDetailModal({
  media,
  isOpen,
  onClose,
  onImageClick,
}: MediaDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [relatedImages, setRelatedImages] = useState<OpenverseImageResult[]>(
    []
  );
  console.log(media, "media......");
  const [relatedAudios, setRelatedAudios] = useState<OpenverseAudioResult[]>(
    []
  );
  const [loadingRelated, setLoadingRelated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isImage = media && "thumbnail" in media && media.thumbnail !== null;
  const isAudio = media && "waveform" in media;

  useEffect(() => {
    if (isAudio && media) {
      audioRef.current = new Audio(media.url);
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current!.currentTime);
        setDuration(audioRef.current!.duration);
      });
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current!.duration);
      });
      return () => {
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }
  }, [isAudio, media]);

  useEffect(() => {
    const fetchRelatedMedia = async () => {
      if (!media || !media.tags) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoadingRelated(true);
      try {
        const tags = media.tags?.map((tag) => tag.name).join(" ") || "";
        if (isImage) {
          // Fetch related images for an image
          const { results: relatedImages } = await api.searchImages(
            { query: tags },
            abortControllerRef.current.signal
          );
          setRelatedImages(relatedImages);
          setRelatedAudios([]); // Clear unrelated audios
        } else if (isAudio) {
          // Fetch related audios for an audio
          const { results: relatedAudios } = await api.searchAudio(
            { query: tags },
            abortControllerRef.current.signal
          );
          setRelatedAudios(relatedAudios);
          setRelatedImages([]); // Clear unrelated images
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Related media fetch aborted");
          return;
        }
        console.error("Failed to fetch related media:", err);
      } finally {
        setLoadingRelated(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchRelatedMedia();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [media, isImage, isAudio]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((err) => console.error("Playback error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (media) {
      window.open(media.url, "_blank");
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (!media || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-zinc-100">
            {media.title || "Untitled"}
          </h2>
          <Button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
          >
            <X size={20} />
          </Button>
        </div>

        {!isAudio && (
          <div>
            <img
              src={media.url}
              alt={media.title || "Untitled"}
              className="w-full rounded-lg max-h-[50vh] object-contain"
            />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">Details</h3>
                <p className="text-zinc-400">
                  Source:{" "}
                  {media.source ? (
                    <a
                      href={media.source}
                      className="text-yellow-400 hover:underline"
                    >
                      {media.source}
                    </a>
                  ) : (
                    "Unknown"
                  )}
                </p>
                <p className="text-zinc-400">
                  Type: {media.extension?.toUpperCase() || "Unknown"}
                </p>
                <p className="text-zinc-400">
                  Dimensions: {media.width || "Unknown"} x{" "}
                  {media.height || "Unknown"} pixels
                </p>
                <p className="text-zinc-400">
                  Tags:{" "}
                  {media.tags?.map((tag) => tag.name).join(", ") || "None"}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">License</h3>
                <p className="text-zinc-400">
                  License: {media.license?.toUpperCase() || "Unknown"}
                </p>
                <p className="text-zinc-400">
                  Creator:{" "}
                  {media.creator_url ? (
                    <a
                      href={media.creator_url}
                      className="text-yellow-400 hover:underline"
                    >
                      {media.creator || "Unknown"}
                    </a>
                  ) : (
                    media.creator || "Unknown"
                  )}
                </p>
                <p className="text-zinc-400">
                  Attribution: "{media.title || "Untitled"}" by{" "}
                  {media.creator || "Unknown"} is licensed under{" "}
                  {media.license?.toUpperCase() || "Unknown"}.
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-900"
                >
                  View in Full Screen
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">
                Related Images
              </h3>
              <MasonryGallery
                images={relatedImages}
                loading={loadingRelated}
                onImageClick={onImageClick}
              />
            </div>
          </div>
        )}

        {isAudio && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-zinc-100">
                  {media.title || "Untitled"}
                </h3>
                <p className="text-zinc-400">
                  by{" "}
                  {media.creator_url ? (
                    <a
                      href={media.creator_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:underline"
                    >
                      {media.creator || "Unknown"}
                    </a>
                  ) : (
                    media.creator || "Unknown"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-zinc-400 text-sm">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-12 flex items-center gap-1">
                {(Array.isArray(media.waveform)
                  ? media.waveform
                  : Array(200)
                      .fill(0)
                      .map(() => Math.random() * 0.5)
                )
                  .slice(0, 200)
                  .map((val, i) => (
                    <div
                      key={i}
                      className="w-1 bg-yellow-400"
                      style={{
                        height: `${val * 48}px`,
                        opacity:
                          currentTime * (200 / (duration || 1)) > i ? 1 : 0.5,
                      }}
                    />
                  ))}
              </div>
              <span className="text-zinc-400 text-sm">
                {formatTime(duration)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">Details</h3>
                <p className="text-zinc-400">
                  Source:{" "}
                  {media.source ? (
                    <a
                      href={media.source}
                      className="text-yellow-400 hover:underline"
                    >
                      {media.source}
                    </a>
                  ) : (
                    "Unknown"
                  )}
                </p>
                <p className="text-zinc-400">
                  Type: {media.extension?.toUpperCase() || "Unknown"}
                </p>
                <p className="text-zinc-400">
                  Duration: {formatTime(media.duration || 0)}
                </p>
                <p className="text-zinc-400">
                  Tags:{" "}
                  {media.tags?.map((tag) => tag.name).join(", ") || "None"}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">License</h3>
                <p className="text-zinc-400">
                  License: {media.license?.toUpperCase() || "Unknown"}
                </p>
                <p className="text-zinc-400">
                  Creator:{" "}
                  {media.creator_url ? (
                    <a
                      href={media.creator_url}
                      className="text-yellow-400 hover:underline"
                    >
                      {media.creator || "Unknown"}
                    </a>
                  ) : (
                    media.creator || "Unknown"
                  )}
                </p>
                <p className="text-zinc-400">
                  Attribution: "{media.title || "Untitled"}" by{" "}
                  {media.creator || "Unknown"} is licensed under{" "}
                  {media.license?.toUpperCase() || "Unknown"}.
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-900"
                >
                  <Download size={20} className="mr-2" /> Download
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">
                Related Audio
              </h3>
              <AudioGallery
                audios={relatedAudios}
                loading={loadingRelated}
                onClick={(audio) => onImageClick(audio as any)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
