import useRecentSearches from "@/hooks/useRecentSearches";
import { X } from "lucide-react";

interface RecentSearchChipsProps {
  onSearch: (query: string) => void;
}

export default function RecentSearchChips({
  onSearch,
}: RecentSearchChipsProps) {
  const { searches, remove, clear } = useRecentSearches();

  if (!searches.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 items-center">
      {searches.slice(0, 4).map((search, index) => (
        <div
          key={index}
          className="group flex items-center px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-300 text-sm border border-zinc-700/50 hover:bg-zinc-700/80 hover:border-yellow-400/50 transition-all duration-200"
        >
          <button onClick={() => onSearch(search)} className="mr-2">
            {search}
          </button>
          <button
            onClick={() => remove(search)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-zinc-600"
          >
            <X size={14} className="text-zinc-400" />
          </button>
        </div>
      ))}
      <button
        onClick={clear}
        className="ml-2 text-sm text-zinc-400 hover:text-yellow-400 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
}
