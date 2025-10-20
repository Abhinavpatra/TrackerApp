# Period Tracker App

A React Native app for tracking menstrual cycles that works completely offline, storing all data locally on your device. Perfect for women who want to monitor their cycles without needing an internet connection.

## Features

- **100% Offline**: Works without internet connection
- **Calendar Interface**: Visual calendar showing period days, predictions, and fertility windows
- **Fertility Tracking**: Track ovulation, fertile windows, and conception likelihood
- **Smart Predictions**: Automatically calculates next period and ovulation dates based on historical data
- **Conception Indicators**: Color-coded calendar showing high/medium/low fertility days
- **Period Modifications**: Adjust period start/end dates if they come early or late
- **Quiet Notifications**: Get silent reminders 1-2 days before your expected period
- **Cycle Statistics**: Track average cycle length, period duration, and ovulation timing
- **Customizable Settings**: Adjust cycle length, period duration, and notification preferences
- **Modular Architecture**: Clean, maintainable codebase with proper separation of concerns
- **Permanent Storage**: All data persists using AsyncStorage (not cache)
- **Greenish-White Theme**: Calming, nature-inspired color scheme
- **Android APK**: Build installable APK files

## What This App Does

This is a comprehensive fertility and period tracking app where you can:
- **Track Periods**: Mark when your period starts and ends
- **Monitor Fertility**: Track ovulation and fertile windows for conception planning
- **View Calendar**: See period days, ovulation, fertile windows, and conception likelihood
- **Modify Dates**: Adjust period dates if they come early or late
- **Get Quiet Notifications**: Receive silent reminders before your period starts
- **View Statistics**: See your average cycle length, period duration, and ovulation timing
- **Predict Future**: App predicts when your next period and ovulation will occur
- **Customize Settings**: Adjust cycle length, period duration, and notification preferences
- **Conception Planning**: See color-coded fertility indicators (high/medium/low)
- **All Offline**: No internet required, all data stored permanently on your device

## Prerequisites

Before you start, make sure you have:

### Required Software
- **Node.js (LTS version)** → [Download here](https://nodejs.org)
- **Java JDK 17 or higher** → [Download here](https://adoptium.net/)
- **Android Studio** → [Download here](https://developer.android.com/studio)

### Android Studio Setup
1. Install Android Studio
2. During installation, make sure to check:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device
3. Open Android Studio and install additional SDK components if prompted

### Environment Variables (Windows)
Add these to your system environment variables:
```
ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

## Quick Start

### 1. Install Dependencies
```bash
cd TrackerApp
npm install
```

### 2. Start Metro Bundler
```bash
npm start
```

### 3. Run on Android Device/Emulator
```bash
npm run android
```

## Building APK Files

### Debug APK (for testing)
```bash
npm run build:android-debug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)
```bash
npm run build:android
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Clean Build (if you have issues)
```bash
npm run clean
npm run build:android
```

## Installing the APK

1. Build the release APK using the command above
2. Copy `app-release.apk` to your Android phone
3. Enable "Install from unknown sources" in your phone settings
4. Tap the APK file to install
5. The app will appear in your app drawer

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (Mac only) |
| `npm run lint` | Check code for errors |
| `npm test` | Run tests |
| `npm run build:android` | Build release APK |
| `npm run build:android-debug` | Build debug APK |
| `npm run clean` | Clean build files |

## Project Structure

```
TrackerApp/
├── App.tsx                 # Main app component
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Calendar.tsx   # Calendar component
│   │   └── Stats.tsx      # Statistics component
│   ├── screens/           # Screen components
│   │   └── Settings.tsx   # Settings screen
│   ├── services/          # Business logic services
│   │   ├── StorageService.ts      # Data persistence
│   │   ├── CycleCalculator.ts     # Cycle calculations
│   │   └── NotificationService.ts # Push notifications
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All type interfaces
│   ├── constants/         # App constants
│   │   └── index.ts       # Colors, defaults, etc.
│   └── utils/             # Utility functions
├── android/              # Android-specific files
│   ├── app/
│   │   └── build.gradle  # Android build configuration
│   └── build.gradle      # Root Android build file
├── ios/                  # iOS-specific files (if needed)
└── README.md            # This file
```

## Data Storage

The app uses **AsyncStorage** for local data persistence:
- Period cycles and settings stored as JSON in device storage
- Survives app restarts and device reboots
- No internet connection required
- Data is completely private to your device
- Automatic cycle length and period duration calculations

### Storage Location
- **Android**: Internal app storage (not accessible to other apps)
- **iOS**: App sandbox (not accessible to other apps)

## Notifications

The app includes local notifications to remind you:
- **Period Reminders**: Get notified 1-2 days before your expected period
- **Customizable**: Adjust notification timing in settings
- **Offline**: Notifications work without internet connection
- **Privacy**: All notification scheduling is done locally

## Customization

### Adding New Features
1. Edit `App.tsx` to add new functionality
2. Update the `PeriodCycle` and `CycleSettings` interfaces if needed
3. Modify the calendar and UI components in the `render` function

### Changing Storage Method
Replace AsyncStorage with SQLite for more complex data:
```bash
npm install expo-sqlite
```

### Styling
All styles are in the `StyleSheet.create()` section at the bottom of `App.tsx`.
The app uses a greenish-white color scheme with these main colors:
- Background: `#f0f8f0` (light greenish-white)
- Primary: `#4a7c59` (forest green)
- Secondary: `#2d5a2d` (dark green)
- Accent: `#6b8e6b` (medium green)

## Troubleshooting

### Common Issues

**"Metro bundler not found"**
```bash
npm install -g @react-native-community/cli
```

**"Android SDK not found"**
- Make sure Android Studio is installed
- Check ANDROID_HOME environment variable
- Run `npx react-native doctor` to diagnose issues

**"Build failed"**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**"App crashes on startup"**
- Check Metro bundler is running (`npm start`)
- Clear Metro cache: `npx react-native start --reset-cache`

### Getting Help
- Check the [React Native documentation](https://reactnative.dev/docs/getting-started)
- Look at [AsyncStorage docs](https://react-native-async-storage.github.io/async-storage/)
- Search for React Native issues on Stack Overflow

## Privacy & Security

- **No Data Collection**: This app doesn't collect any personal data
- **Local Storage Only**: All period data stays on your device
- **No Internet Required**: App works completely offline
- **No Tracking**: No analytics or user tracking
- **Complete Privacy**: Your menstrual cycle data never leaves your device
- **Secure Notifications**: All notifications are scheduled locally

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve the documentation

---

**Happy Period Tracking!**

Built with React Native, TypeScript, AsyncStorage, and Push Notifications.