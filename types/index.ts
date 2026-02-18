export type ThemeName = 'zen' | 'paper' | 'midnight' | 'slate' | 'crimson' | 'ocean' | 'forest' | 'amber';

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
  fontSize: number;
  onboardingComplete: boolean;
  reminder: ReminderSettings;
  openaiApiKey: string;
}

export interface LibraryItem {
  id: number;
  type: 'TEXT' | 'LINK' | 'PDF' | 'DOCX';
  title: string;
  content: string;
}
