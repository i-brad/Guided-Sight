import { ThemeName, ThemeColors } from '@/types';

export const themes: Record<ThemeName, ThemeColors> = {
  zen: {
    background: '#121212',
    text: '#e0e0e0',
    overlayBase: '10, 10, 10',
    overlayOpacity: 0.98,
    accent: '#ffffff',
    cardBackground: 'rgba(128, 128, 128, 0.05)',
    cardBorder: 'rgba(128, 128, 128, 0.1)',
    mutedText: 'rgba(128, 128, 128, 0.6)',
  },
  paper: {
    background: '#f5f5f0',
    text: '#1a1a1a',
    overlayBase: '245, 245, 240',
    overlayOpacity: 0.98,
    accent: '#000000',
    cardBackground: 'rgba(128, 128, 128, 0.05)',
    cardBorder: 'rgba(128, 128, 128, 0.1)',
    mutedText: 'rgba(128, 128, 128, 0.6)',
  },
  midnight: {
    background: '#000000',
    text: '#ffffff',
    overlayBase: '0, 0, 0',
    overlayOpacity: 0.98,
    accent: '#ffffff',
    cardBackground: 'rgba(128, 128, 128, 0.05)',
    cardBorder: 'rgba(128, 128, 128, 0.1)',
    mutedText: 'rgba(128, 128, 128, 0.6)',
  },
};
