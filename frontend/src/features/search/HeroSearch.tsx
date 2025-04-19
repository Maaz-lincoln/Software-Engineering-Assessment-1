import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecentSearchChips from "./RecentSearchChips";
import useRecentSearches from "../../hooks/useRecentSearches";

const CONTENT_TYPES = [
  { value: "all", label: "All Assets" },
  { value: "image", label: "Images" },
  { value: "audio", label: "Audio" },
];

export default function HeroSearch() {
  const [query, setQuery] = useState<string>("");
  const [contentType, setContentType] = useState<string>("all");
  const navigate = useNavigate();
  const { add } = useRecentSearches();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    add(query.trim());
    const params = new URLSearchParams({ query, type: contentType });
    navigate(`/search?${params.toString()}`);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    add(q);
    const params = new URLSearchParams({ query: q, type: contentType });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-[60%]">
      <form
        className="flex w-full rounded-lg overflow-hidden shadow-lg backdrop-blur-md bg-zinc-900/30 border border-zinc-700/50"
        onSubmit={handleSubmit}
      >
        <Input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search for creative assets..."
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-zinc-100 h-14 rounded-none rounded-l-lg text-lg px-4 placeholder-zinc-500"
        />
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="w-28 h-[57px]  bg-zinc-800/50 text-zinc-100 border-none rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-zinc-100 border-zinc-700 h-full">
            {CONTENT_TYPES.map((t) => (
              <SelectItem
                key={t.value}
                value={t.value}
                className="hover:bg-zinc-800"
              >
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          className="h-14 rounded-none rounded-r-lg px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-zinc-900 text-lg font-bold transition-all duration-300"
        >
          <Search size={24} />
        </Button>
      </form>
      <RecentSearchChips onSearch={handleRecentClick} />
    </div>
  );
}
