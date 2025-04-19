import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Filters } from "../../types/filters";

interface FiltersContextProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextProps | undefined>(
  undefined
);

function parseFiltersFromURL(search: string): Filters {
  const params = new URLSearchParams(search);
  const filters: Filters = {};
  if (params.has("license"))
    filters.license = params.get("license")?.split(",");
  if (params.has("use_commercial"))
    filters.use_commercial = params.get("use_commercial") === "true";
  if (params.has("modifiable"))
    filters.modifiable = params.get("modifiable") === "true";
  if (params.has("extension"))
    filters.extension = params.get("extension")?.split(",");
  if (params.has("source")) filters.source = params.get("source")?.split(",");
  if (params.has("aspect_ratio"))
    filters.aspect_ratio = params.get("aspect_ratio");
  if (params.has("size")) filters.size = params.get("size");
  if (params.has("image_type")) filters.image_type = params.get("image_type");
  if (params.has("mature")) filters.sensitive = params.get("mature") === "true";
  if (params.has("filter_dead"))
    filters.blur_sensitive = params.get("filter_dead") === "true";
  return filters;
}

function filtersToURLParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.license?.length) params.set("license", filters.license.join(","));
  if (filters.use_commercial !== undefined)
    params.set("use_commercial", String(filters.use_commercial));
  if (filters.modifiable !== undefined)
    params.set("modifiable", String(filters.modifiable));
  if (filters.extension?.length)
    params.set("extension", filters.extension.join(","));
  if (filters.source?.length) params.set("source", filters.source.join(","));
  if (filters.aspect_ratio) params.set("aspect_ratio", filters.aspect_ratio);
  if (filters.size) params.set("size", filters.size);
  if (filters.image_type) params.set("image_type", filters.image_type);
  if (filters.sensitive !== undefined)
    params.set("mature", String(filters.sensitive));
  if (filters.blur_sensitive !== undefined)
    params.set("filter_dead", String(filters.blur_sensitive));
  return params;
}

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFiltersState] = useState<Filters>(() =>
    parseFiltersFromURL(location.search)
  );

  useEffect(() => {
    setFiltersState(parseFiltersFromURL(location.search));
  }, [location.search]);

  const setFilters = (f: Filters) => {
    setFiltersState(f);
    const newParams = filtersToURLParams(f);
    const baseParams = new URLSearchParams(location.search);
    [
      "license",
      "use_commercial",
      "modifiable",
      "extension",
      "source",
      "aspect_ratio",
      "size",
      "image_type",
      "mature",
      "filter_dead",
    ].forEach((k) => baseParams.delete(k));
    newParams.forEach((value, key) => {
      if (value) baseParams.set(key, value);
    });
    navigate({ search: `?${baseParams.toString()}` }, { replace: true });
  };

  const clearFilters = () => {
    setFiltersState({});
    const params = new URLSearchParams(location.search);
    [
      "license",
      "use_commercial",
      "modifiable",
      "extension",
      "source",
      "aspect_ratio",
      "size",
      "image_type",
      "mature",
      "filter_dead",
    ].forEach((k) => params.delete(k));
    navigate({ search: `?${params.toString()}` }, { replace: true });
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be inside FiltersProvider");
  return ctx;
};
