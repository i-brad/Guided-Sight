import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@guided_sight_reading_stats';

interface DailyEntry {
  date: string; // YYYY-MM-DD
  seconds: number;
}

interface ReadingStatsData {
  dailyEntries: DailyEntry[];
  totalSeconds: number;
}

interface ReadingStatsContextValue {
  stats: ReadingStatsData;
  todaySeconds: number;
  weekSeconds: number;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

const ReadingStatsContext = createContext<ReadingStatsContextValue | null>(null);

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const defaultStats: ReadingStatsData = {
  dailyEntries: [],
  totalSeconds: 0,
};

export function ReadingStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ReadingStatsData>(defaultStats);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTrackingRef = useRef(false);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setStats(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (stats.totalSeconds > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const addSecond = useCallback(() => {
    const today = getToday();
    setStats((prev) => {
      const entries = [...prev.dailyEntries];
      const todayIdx = entries.findIndex((e) => e.date === today);
      if (todayIdx >= 0) {
        entries[todayIdx] = { ...entries[todayIdx], seconds: entries[todayIdx].seconds + 1 };
      } else {
        entries.push({ date: today, seconds: 1 });
      }
      // Keep only last 90 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      const trimmed = entries.filter((e) => e.date >= cutoffStr);

      return {
        dailyEntries: trimmed,
        totalSeconds: prev.totalSeconds + 1,
      };
    });
  }, []);

  const startTracking = useCallback(() => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setIsTracking(true);
    intervalRef.current = setInterval(addSecond, 1000);
  }, [addSecond]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Pause on app background, resume on foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isTrackingRef.current && !intervalRef.current) {
        intervalRef.current = setInterval(addSecond, 1000);
      } else if (nextState !== 'active' && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => {
      sub.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addSecond]);

  const today = getToday();
  const todaySeconds = stats.dailyEntries.find((e) => e.date === today)?.seconds ?? 0;

  const weekDates = getWeekDates();
  const weekSeconds = stats.dailyEntries
    .filter((e) => weekDates.includes(e.date))
    .reduce((sum, e) => sum + e.seconds, 0);

  return (
    <ReadingStatsContext.Provider
      value={{ stats, todaySeconds, weekSeconds, isTracking, startTracking, stopTracking }}
    >
      {children}
    </ReadingStatsContext.Provider>
  );
}

export function useReadingStats() {
  const ctx = useContext(ReadingStatsContext);
  if (!ctx) throw new Error('useReadingStats must be used within ReadingStatsProvider');
  return ctx;
}
