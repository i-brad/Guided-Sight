import { Highlight } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@guided_sight_highlights';

interface HighlightsContextValue {
  highlights: Highlight[];
  addHighlight: (documentId: number, paragraphIndex: number, text: string, note?: string) => void;
  removeHighlight: (id: number) => void;
  getHighlightsForDocument: (documentId: number) => Highlight[];
  isHighlighted: (documentId: number, paragraphIndex: number) => boolean;
}

const HighlightsContext = createContext<HighlightsContextValue | null>(null);

export function HighlightsProvider({ children }: { children: React.ReactNode }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Highlight[];
          if (parsed.length > 0) setHighlights(parsed);
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(highlights));
    }
  }, [highlights, isLoaded]);

  const addHighlight = (documentId: number, paragraphIndex: number, text: string, note?: string) => {
    const highlight: Highlight = {
      id: Date.now(),
      documentId,
      paragraphIndex,
      text,
      ...(note ? { note } : {}),
      createdAt: Date.now(),
    };
    setHighlights((prev) => [highlight, ...prev]);
  };

  const removeHighlight = (id: number) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  const getHighlightsForDocument = useCallback(
    (documentId: number) => highlights.filter((h) => h.documentId === documentId),
    [highlights]
  );

  const isHighlighted = useCallback(
    (documentId: number, paragraphIndex: number) =>
      highlights.some((h) => h.documentId === documentId && h.paragraphIndex === paragraphIndex),
    [highlights]
  );

  return (
    <HighlightsContext.Provider
      value={{ highlights, addHighlight, removeHighlight, getHighlightsForDocument, isHighlighted }}
    >
      {children}
    </HighlightsContext.Provider>
  );
}

export function useHighlights() {
  const ctx = useContext(HighlightsContext);
  if (!ctx) throw new Error('useHighlights must be used within HighlightsProvider');
  return ctx;
}
