export type ThemeName = 'zen' | 'paper' | 'midnight';

export interface ThemeColors {
  background: string;
  text: string;
  overlayBase: string;
  overlayOpacity: number;
  accent: string;
  cardBackground: string;
  cardBorder: string;
  mutedText: string;
}

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface Settings {
  theme: ThemeName;
  overlayOpacity: number;
  focusHeight: number;
  onboardingComplete: boolean;
  reminder: ReminderSettings;
}

export interface LibraryItem {
  id: number;
  type: 'TEXT' | 'LINK' | 'PDF';
  title: string;
  content: string;
}
