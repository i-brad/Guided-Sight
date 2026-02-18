# Guided Sight

A focused reading app for iOS, Android, and web. Guided Sight uses a "focus tunnel" overlay that follows your finger, dimming everything except the line you're currently reading — helping you read with less distraction.

## Features

- **Focus Tunnel** — A movable spotlight that highlights only the text you're reading while dimming the rest of the screen. Drag to reposition, resize with the reader controls.
- **Document Library** — Browse your imported documents in a grid or list view.
- **PDF Import** — Upload PDFs and automatically extract their text content for focused reading.
- **Manual Text Entry** — Paste or type text directly into the app.
- **Reading Themes** — Switch between Zen, Paper, and Midnight themes. Adjust overlay opacity and default focus height.
- **Reading Analytics** — Track daily reading time, weekly totals, all-time stats, and reading streaks with a 7-day bar chart.
- **Daily Reminders** — Schedule push notifications to build a consistent reading habit.
- **Onboarding** — A guided walkthrough introducing the core concepts on first launch.

## Tech Stack

- [Expo](https://expo.dev) SDK 54
- [React Native](https://reactnative.dev) 0.81
- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) for touch interactions
- TypeScript

## Project Structure

```text
app/
  _layout.tsx       # Root layout with providers (Theme, Library, ReadingStats)
  index.tsx         # Entry point — routes to onboarding or library
  onboarding.tsx    # First-launch walkthrough
  library.tsx       # Document library (grid/list)
  reader.tsx        # Reading screen with focus tunnel
  import.tsx        # Import documents (PDF, text, URL)
  settings.tsx      # Theme, opacity, focus height, reminders
  reminder.tsx      # Configure daily reading reminders
  analytics.tsx     # Reading stats and weekly chart
components/         # Reusable UI components
context/            # React context providers (Theme, Library, ReadingStats)
hooks/              # Custom hooks (useSpotlight)
constants/          # Theme definitions and sample data
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install

```bash
npm install
```

### Run

```bash
npx expo start
```

From there you can open the app in:

- [Expo Go](https://expo.dev/go) on a physical device
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- Web browser

## Scripts

| Command                  | Description                |
| ------------------------ | -------------------------- |
| `npm start`              | Start the Expo dev server  |
| `npm run ios`            | Start on iOS simulator     |
| `npm run android`        | Start on Android emulator  |
| `npm run web`            | Start in web browser       |
| `npm run lint`           | Run ESLint                 |
| `npm run reset-project`  | Reset to a blank project   |
