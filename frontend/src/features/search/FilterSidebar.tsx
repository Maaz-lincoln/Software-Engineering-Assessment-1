import type React from "react";
import { useFilters } from "./filtersContext";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";

const LICENSES = [
  { value: "pdm", label: "Public Domain Mark" },
  { value: "cc0", label: "CC0" },
  { value: "by", label: "CC BY" },
  { value: "by-sa", label: "CC BY-SA" },
  { value: "by-nd", label: "CC BY-ND" },
  { value: "by-nc", label: "CC BY-NC" },
  { value: "by-nc-sa", label: "CC BY-NC-SA" },
  { value: "by-nc-nd", label: "CC BY-NC-ND" },
];
const IMAGE_TYPES = [
  { value: "photo", label: "Photographs" },
  { value: "illustration", label: "Illustrations" },
  { value: "digitized_artwork", label: "Digitized Artworks" },
];
const EXTENSIONS = ["jpg", "png", "gif"];
const ASPECTS = [
  { value: "tall", label: "Tall" },
  { value: "wide", label: "Wide" },
  { value: "square", label: "Square" },
];
const SIZES = ["small", "medium", "large"];
const SOURCES = [
  "nasa",
  "flickr",
  "wikimedia",
  "europeana",
  "rijksmuseum",
  "smithsonian",
  "brooklynmuseum",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-4 font-semibold tracking-wide text-zinc-300 uppercase text-xs">
      {children}
    </div>
  );
}

export default function FilterSidebar() {
  const { filters, setFilters, clearFilters } = useFilters();

  const toggleArrayFilter = (field: keyof typeof filters, value: string) => {
    setFilters({
      ...filters,
      [field]: (filters[field] as string[])?.includes(value)
        ? (filters[field] as string[])?.filter((v) => v !== value)
        : [...((filters[field] as string[]) || []), value],
    });
  };

  const setSingleFilter = (
    field: keyof typeof filters,
    value: string | undefined
  ) => {
    setFilters({
      ...filters,
      [field]: filters[field] === value ? undefined : value,
    });
  };

  let filterLength = Object.keys(filters).length;
  return (
    <aside className="w-full md:w-72 p-4 bg-zinc-900/90 rounded-2xl shadow-2xl sticky top-5 border border-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-zinc-200 tracking-wide">
          {`Filters ${filterLength > 0 ? `(${filterLength})` : ""}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-zinc-400 hover:text-red-400 transition-colors"
        >
          Clear All
        </Button>
      </div>
      <Separator className="my-2 bg-zinc-700" />
      <SectionTitle>Usage</SectionTitle>
      <div className="flex items-center gap-3 mb-1">
        <Checkbox
          id="commercial"
          checked={!!filters.use_commercial}
          onCheckedChange={(v) =>
            setFilters({ ...filters, use_commercial: !!v })
          }
          className="border-zinc-700"
        />
        <label htmlFor="commercial" className="text-zinc-100">
          Use commercially
        </label>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <Checkbox
          id="modifiable"
          checked={!!filters.modifiable}
          onCheckedChange={(v) => setFilters({ ...filters, modifiable: !!v })}
          className="border-zinc-700"
        />
        <label htmlFor="modifiable" className="text-zinc-100">
          Modify or adapt
        </label>
      </div>
      <SectionTitle>Licenses</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2">
        {LICENSES.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={
              filters.license?.includes(opt.value) ? "default" : "outline"
            }
            className={
              filters.license?.includes(opt.value)
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => toggleArrayFilter("license", opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <SectionTitle>Image Type</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2">
        {IMAGE_TYPES.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={filters.image_type === opt.value ? "default" : "outline"}
            className={
              filters.image_type === opt.value
                ? "border-blue-400 bg-blue-400/20 text-blue-300 hover:bg-blue-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => setSingleFilter("image_type", opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <SectionTitle>Extension</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2">
        {EXTENSIONS.map((ext) => (
          <Button
            key={ext}
            size="sm"
            variant={filters.extension?.includes(ext) ? "default" : "outline"}
            className={
              filters.extension?.includes(ext)
                ? "border-green-400 bg-green-400/20 text-green-300 hover:bg-green-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => toggleArrayFilter("extension", ext)}
          >
            {ext.toUpperCase()}
          </Button>
        ))}
      </div>
      <SectionTitle>Aspect Ratio</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2">
        {ASPECTS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={filters.aspect_ratio === opt.value ? "default" : "outline"}
            className={
              filters.aspect_ratio === opt.value
                ? "border-emerald-400 bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => setSingleFilter("aspect_ratio", opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <SectionTitle>Image Size</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2">
        {SIZES.map((sz) => (
          <Button
            key={sz}
            size="sm"
            variant={filters.size === sz ? "default" : "outline"}
            className={
              filters.size === sz
                ? "border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-300 hover:bg-fuchsia-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => setSingleFilter("size", sz)}
          >
            {sz.charAt(0).toUpperCase() + sz.slice(1)}
          </Button>
        ))}
      </div>
      <SectionTitle>Source</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-2 max-h-32 overflow-auto">
        {SOURCES.map((src) => (
          <Button
            key={src}
            size="sm"
            variant={filters.source?.includes(src) ? "default" : "outline"}
            className={
              filters.source?.includes(src)
                ? "border-orange-400 bg-orange-400/20 text-orange-300 hover:bg-orange-400/30"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
            onClick={() => toggleArrayFilter("source", src)}
          >
            {src}
          </Button>
        ))}
      </div>
      <SectionTitle>Safe Browsing</SectionTitle>
      <div className="flex items-center gap-3 mb-2">
        <Switch
          id="sensitive"
          checked={!!filters.sensitive}
          onCheckedChange={(v) => setFilters({ ...filters, sensitive: !!v })}
          className="data-[state=checked]:bg-yellow-400 bg-gray-700"
        />
        <label htmlFor="sensitive" className="text-zinc-100">
          Show sensitive results
        </label>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Switch
          id="blurSensitive"
          checked={!!filters.blur_sensitive}
          onCheckedChange={(v) =>
            setFilters({ ...filters, blur_sensitive: !!v })
          }
          className="data-[state=checked]:bg-yellow-400 bg-gray-700"
        />
        <label htmlFor="blurSensitive" className="text-zinc-100">
          Blur sensitive content
        </label>
      </div>
    </aside>
  );
}
