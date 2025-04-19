import { useCallback, useState, useEffect } from "react";

const RECENT_KEY = "olm_recent_searches";
const MAX = 10;

export default function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(() => {
    try {
      const val = localStorage.getItem(RECENT_KEY);
      return val ? (JSON.parse(val) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === RECENT_KEY) {
        try {
          const val = e.newValue ? (JSON.parse(e.newValue) as string[]) : [];
          setSearches(val);
        } catch {
          setSearches([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const add = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearches((prev) => {
      const updated = prev.filter((q) => q !== query);
      updated.unshift(query.trim());
      if (updated.length > MAX) updated.pop();

      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter((q) => q !== query);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setSearches([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return { searches, add, remove, clear };
}
