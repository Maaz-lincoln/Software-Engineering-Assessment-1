import React, { useState } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import { Play, Pause } from "lucide-react";
import type { OpenverseAudioResult } from "../../lib/openverseApi";

interface AudioGalleryProps {
  audios: OpenverseAudioResult[];
  loading: boolean;
  onClick?: (audio: OpenverseAudioResult) => void;
}

export default function AudioGallery({
  audios,
  loading,
  onClick,
}: AudioGalleryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = React.useRef<Map<string, HTMLAudioElement>>(new Map());

  const togglePlay = (audio: OpenverseAudioResult) => {
    const audioElement = audioRefs.current.get(audio.id);
    if (!audioElement) {
      const newAudio = new Audio(audio.url);
      audioRefs.current.set(audio.id, newAudio);
      newAudio.addEventListener("ended", () => setPlayingId(null));
      newAudio.play().catch((err) => console.error("Playback error:", err));
      setPlayingId(audio.id);
    } else if (playingId === audio.id) {
      audioElement.pause();
      setPlayingId(null);
    } else {
      audioRefs.current.forEach((a, id) => {
        if (id !== audio.id) {
          a.pause();
        }
      });
      audioElement.currentTime = 0;
      audioElement.play().catch((err) => console.error("Playback error:", err));
      setPlayingId(audio.id);
    }
  };

  React.useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => audio.pause());
      audioRefs.current.clear();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="w-full h-24 rounded-lg bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!audios.length) {
    return (
      <div className="py-12 text-center text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <p className="text-lg">No audio results found.</p>
        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      {audios.map((audio) => {
        const waveform = Array.isArray(audio.waveform)
          ? audio.waveform
          : Array(100)
              .fill(0)
              .map(() => Math.random() * 0.5);

        return (
          <div
            key={audio.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 transition-all duration-300 cursor-pointer group"
            onClick={() => onClick?.(audio)}
          >
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(audio);
                }}
                className="text-white hover:scale-110 transition-transform"
              >
                {playingId === audio.id ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-zinc-100 !w-[50vw] font-semibold truncate">
                  {audio.title || "Untitled"}
                </h3>
              </div>
              <div className="flex gap-2 items-center mt-1">
                <p className="text-sm text-zinc-400">
                  by {audio.creator || "Unknown"}
                </p>

                <span className="text-xs text-zinc-400">
                  lisence:{audio.license.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 h-6">
                {waveform.slice(0, 100).map((val, i) => (
                  <div
                    key={i}
                    className="w-1 bg-zinc-400 group-hover:bg-yellow-400 transition-colors"
                    style={{ height: `${val * 24}px` }}
                  />
                ))}
              </div>
            </div>
            <span className="text-zinc-400 text-sm">
              {audio.duration
                ? `${Math.floor(audio.duration / 60)}:${(audio.duration % 60)
                    .toString()
                    .padStart(2, "0")}`
                : "0:00"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
