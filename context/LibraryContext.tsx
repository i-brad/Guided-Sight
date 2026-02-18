import { LibraryItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@guided_sight_library";

interface LibraryContextValue {
  items: LibraryItem[];
  addItem: (item: Omit<LibraryItem, "id">) => number;
  removeItem: (id: number) => void;
  getItem: (id: number) => LibraryItem | undefined;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as LibraryItem[];
          if (parsed.length > 0) setItems(parsed);
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<LibraryItem, "id">): number => {
    const id = Date.now();
    setItems((prev) => [{ ...item, id }, ...prev]);
    return id;
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getItem = (id: number) => items.find((i) => i.id === id);

  return (
    <LibraryContext.Provider value={{ items, addItem, removeItem, getItem }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
