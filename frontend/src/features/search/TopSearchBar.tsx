import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Search, History, ChevronDown, X } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import useRecentSearches from "@/hooks/useRecentSearches";
import { toast } from "sonner";

interface TopSearchBarProps {
  defaultQuery: string;
  defaultType: string;
  onSearch: (query: string, type: string) => void;
  onTypeChange: (type: string) => void;
}

const searchTypes = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "audio", label: "Audio" },
];

const TopSearchBar = ({
  defaultQuery,
  defaultType,
  onSearch,
  onTypeChange,
}: TopSearchBarProps) => {
  const [query, setQuery] = useState(defaultQuery);
  const [type, setType] = useState(defaultType);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null); // Add a ref for the modal

  const { searches, add, remove, clear } = useRecentSearches();

  // Handle clicks inside the modal to prevent blur
  const handleModalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the input from losing focus
  };

  const handleSearch = () => {
    if (query.trim()) {
      console.log("Performing search:", query, type);
      onSearch(query, type);
      add(query);
      inputRef.current?.blur();
    }
  };

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    add(recentQuery);
    onSearch(recentQuery, type);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearAll = () => {
    clear();
    toast.success("Recent searches cleared", {
      description: "All recent searches have been removed.",
    });
  };

  const handleRemoveSearch = (recent: string) => {
    remove(recent);
    toast.success("Search removed", {
      description: `"${recent}" has been removed from recent searches.`,
    });
  };

  return (
    <div className="relative w-full  max-w-8xl mx-auto">
      <div className="flex items-center gap-3 rounded-xl shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search for open license media..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
          />
        </div>

        <Listbox
          value={type}
          onChange={(value) => {
            setType(value);
            onTypeChange(value);
          }}
        >
          {({ open }) => (
            <div className="relative w-32">
              <Listbox.Button className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-all duration-200">
                <span>{searchTypes.find((t) => t.value === type)?.label}</span>
                <ChevronDown
                  className={`ml-2 text-zinc-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </Listbox.Button>
              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options className="absolute z-40 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                  {searchTypes.map((searchType) => (
                    <Listbox.Option
                      key={searchType.value}
                      value={searchType.value}
                      className={({ active }) =>
                        `cursor-pointer select-none p-2 text-zinc-200 ${
                          active ? "bg-yellow-400 text-zinc-900" : ""
                        }`
                      }
                    >
                      {searchType.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>

        <Button
          onClick={handleSearch}
          className="bg-yellow-400 text-zinc-900 hover:bg-yellow-300 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200"
        >
          <Search size={18} />
          Search
        </Button>
      </div>

      {isFocused && searches.length > 0 && (
        <Transition
          show={isFocused}
          enter="transition ease-out duration-150"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            ref={modalRef}
            onMouseDown={handleModalMouseDown}
            className="absolute z-30 w-full max-h-48 overflow-y-scroll  mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="text-zinc-400" size={20} />
                <h3 className="text-zinc-200 font-semibold">Recent Searches</h3>
              </div>
              <Button
                onClick={handleClearAll}
                size="sm"
                variant="ghost"
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </Button>
            </div>
            <ul className="space-y-1">
              {searches.map((recent, index) => (
                <div key={index} className="flex gap-2">
                  <li
                    className="flex flex-1 items-center justify-between p-2 rounded-lg hover:bg-zinc-700 text-zinc-200 cursor-pointer transition-all duration-150"
                    onClick={() => handleRecentSearch(recent)}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="text-zinc-400" size={16} />
                      <span>{recent}</span>
                    </div>
                  </li>
                  <button
                    type="button"
                    onClick={() => handleRemoveSearch(recent)}
                    className="text-zinc-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-zinc-600"
                    aria-label={`Remove ${recent} from recent searches`}
                  >
                    <X className="w-8 h-4" />
                  </button>
                </div>
              ))}
            </ul>
          </div>
        </Transition>
      )}
    </div>
  );
};
export default TopSearchBar;
