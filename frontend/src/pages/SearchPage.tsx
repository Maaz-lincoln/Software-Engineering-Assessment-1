import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopSearchBar from "../features/search/TopSearchBar";
import FilterSidebar from "../features/search/FilterSidebar";
import MasonryGallery from "../features/search/MasonryGallery";
import AudioGallery from "../features/search/AudioGallery";
import { FiltersProvider, useFilters } from "../features/search/filtersContext";
import { OpenverseApi } from "../lib/openverseApi";
import type {
  OpenverseImageResult,
  OpenverseAudioResult,
} from "../lib/openverseApi";
import { Button } from "../components/ui/button";
import MediaDetailModal from "@/components/modals/MediaDetailModal";
import TopNav from "@/components/shared/TopNav";

const api = new OpenverseApi();

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filters } = useFilters();
  const [images, setImages] = useState<OpenverseImageResult[]>([]);
  const [audios, setAudios] = useState<OpenverseAudioResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePage, setImagePage] = useState(1);
  const [audioPage, setAudioPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [hasMoreAudios, setHasMoreAudios] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<
    OpenverseImageResult | OpenverseAudioResult | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false); // Track if fetch has been triggered

  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";
  const type = params.get("type") || "all";

  const fetchResults = useCallback(
    async (page: number, append = false) => {
      if (!query || (hasFetchedRef.current && !append)) return;

      hasFetchedRef.current = true;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!append) {
        setLoading(true);
        setImages([]);
        setAudios([]);
        setHasMoreImages(true);
        setHasMoreAudios(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      try {
        if (type === "image" || type === "all") {
          const { results, total } = await api.searchImages(
            { query, page, ...filters, type: "image" },
            abortControllerRef.current.signal
          );
          setImages((prev) => (append ? [...prev, ...results] : results));
          setHasMoreImages(
            results.length > 0 &&
              (append ? prev.length + results.length : results.length) < total
          );
        }

        if (type === "audio" || type === "all") {
          const { results, total } = await api.searchAudio(
            { query, page, ...filters, type: "audio" },
            abortControllerRef.current.signal
          );
          setAudios((prev) => (append ? [...prev, ...results] : results));
          setHasMoreAudios(
            results.length > 0 &&
              (append ? prev.length + results.length : results.length) < total
          );
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error(err);
        hasFetchedRef.current = false;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, type, filters]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setImagePage(1);
      setAudioPage(1);
      hasFetchedRef.current = false;
      fetchResults(1);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, type, filters, fetchResults]);

  const handleLoadMoreImages = () => {
    const nextPage = imagePage + 1;
    setImagePage(nextPage);
    fetchResults(nextPage, true);
  };

  const handleLoadMoreAudios = () => {
    const nextPage = audioPage + 1;
    setAudioPage(nextPage);
    fetchResults(nextPage, true);
  };

  const handleSearch = (newQuery: string, newType: string) => {
    const params = new URLSearchParams(location.search);
    params.set("query", newQuery);
    params.set("type", newType);
    navigate(`/search?${params.toString()}`);
  };

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(location.search);
    params.set("type", newType);
    navigate(`/search?${params.toString()}`);
  };

  const handleMediaClick = (
    media: OpenverseImageResult | OpenverseAudioResult
  ) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-zinc-950 to-blue-950 pt-20">
      <TopNav />
      <div className="max-w-8xl mx-auto px-4">
        <TopSearchBar
          defaultQuery={query}
          defaultType={type}
          onSearch={handleSearch}
          onTypeChange={handleTypeChange}
        />
        <div className="flex gap-6 mt-6">
          <div className="w-72 hidden md:block">
            <FilterSidebar />
          </div>
          <div className="flex-1">
            {error && (
              <div className="p-4 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
                {error}
              </div>
            )}
            {(type === "image" || type === "all") && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-zinc-200 mb-4">
                  Images
                </h2>
                <MasonryGallery
                  images={images}
                  loading={loading}
                  onImageClick={handleMediaClick}
                />
                {hasMoreImages && !loading && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleLoadMoreImages}
                      disabled={loadingMore}
                      className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900"
                    >
                      {loadingMore ? "Loading..." : "Load More Images"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {(type === "audio" || type === "all") && (
              <div>
                <h2 className="text-xl font-semibold text-zinc-200 mb-4">
                  Audio
                </h2>
                <AudioGallery
                  audios={audios}
                  loading={loading}
                  onClick={handleMediaClick}
                />
                {hasMoreAudios && !loading && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleLoadMoreAudios}
                      disabled={loadingMore}
                      className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900"
                    >
                      {loadingMore ? "Loading..." : "Load More Audio"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <MediaDetailModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageClick={handleMediaClick}
      />
    </div>
  );
};

export default () => (
  <FiltersProvider>
    <SearchPage />
  </FiltersProvider>
);
