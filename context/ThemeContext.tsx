import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, Settings, ReminderSettings, SpotlightPosition } from '@/types';
import { themes } from '@/constants/themes';

const STORAGE_KEY = '@guided_sight_settings';

const defaultSettings: Settings = {
  theme: 'zen',
  overlayOpacity: 98,
  focusHeight: 80,
  fontSize: 19,
  onboardingComplete: false,
  reminder: { enabled: false, hour: 20, minute: 0 },
  openaiApiKey: '',
  spotlightPosition: 'top',
};

interface ThemeContextValue {
  settings: Settings;
  colors: ThemeColors;
  isLoaded: boolean;
  setTheme: (name: ThemeName) => void;
  setOverlayOpacity: (val: number) => void;
  setFocusHeight: (val: number) => void;
  setFontSize: (val: number) => void;
  setOnboardingComplete: (val: boolean) => void;
  setReminder: (val: ReminderSettings) => void;
  setOpenaiApiKey: (key: string) => void;
  setSpotlightPosition: (val: SpotlightPosition) => void;
  saveSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<Settings>;
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const colors: ThemeColors = {
    ...themes[settings.theme],
    overlayOpacity: settings.overlayOpacity / 100,
  };

  const saveSettings = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setTheme = (name: ThemeName) =>
    setSettings((prev) => ({ ...prev, theme: name }));

  const setOverlayOpacity = (val: number) =>
    setSettings((prev) => ({ ...prev, overlayOpacity: val }));

  const setFocusHeight = (val: number) =>
    setSettings((prev) => ({ ...prev, focusHeight: val }));

  const setFontSize = (val: number) =>
    setSettings((prev) => ({ ...prev, fontSize: val }));

  const setOnboardingComplete = (val: boolean) =>
    setSettings((prev) => ({ ...prev, onboardingComplete: val }));

  const setReminder = (val: ReminderSettings) =>
    setSettings((prev) => ({ ...prev, reminder: val }));

  const setOpenaiApiKey = (key: string) =>
    setSettings((prev) => ({ ...prev, openaiApiKey: key }));

  const setSpotlightPosition = (val: SpotlightPosition) =>
    setSettings((prev) => ({ ...prev, spotlightPosition: val }));

  // Auto-save whenever settings change after initial load
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        colors,
        isLoaded,
        setTheme,
        setOverlayOpacity,
        setFocusHeight,
        setFontSize,
        setOnboardingComplete,
        setReminder,
        setOpenaiApiKey,
        setSpotlightPosition,
        saveSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
