# Grama-Urja: Crowdsourced Power Monitor

An Android application that helps rural farmers monitor and share power availability in their community using Firebase Realtime Database and push notifications.

## Features

✅ **Real-time Power Status Updates** - Status syncs across all users within 2 seconds
✅ **Zone-Based Monitoring** - Select your transformer zone to get relevant updates
✅ **Data Freshness Indicator** - See how recent the power status is ("Updated 2 mins ago")
✅ **High-Contrast UI** - Optimized for outdoor visibility with large, bold text
✅ **Push Notifications** - Get instant alerts when power returns in your zone
✅ **Pump Timer** - Calculate optimal irrigation duration based on crop type

## Technical Stack

- **Android SDK**: API 24+ (Android 7.0 and above)
- **Database**: Firebase Realtime Database
- **Messaging**: Firebase Cloud Messaging (FCM)
- **UI Framework**: AndroidX, Material Design Components
- **Language**: Java

## Project Structure

```
GramaUrja/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/gramaUrja/
│   │       │   ├── MainActivity.java           # Main power status screen
│   │       │   ├── ZoneSelectionActivity.java  # Zone selection
│   │       │   ├── PumpTimerActivity.java      # Pump timer utility
│   │       │   ├── ZoneAdapter.java            # RecyclerView adapter
│   │       │   └── FirebaseMessagingService.java # Push notification handler
│   │       ├── res/
│   │       │   ├── layout/                     # XML layout files
│   │       │   ├── drawable/                   # Button & shape drawables
│   │       │   └── values/                     # Colors, strings, styles
│   │       └── AndroidManifest.xml
│   ├── build.gradle                            # App dependencies & config
│   ├── google-services.json                    # Firebase configuration
│   └── proguard-rules.pro                      # Obfuscation rules
├── build.gradle                                # Root Gradle config
└── settings.gradle                             # Module definitions
```

## Setup Instructions

### Prerequisites
- Android Studio 2023.2+ (Giraffe or newer)
- Android SDK 34
- Gradle 8.0+
- Java 8+

### Step 1: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "grama-urja-dev"
3. Add Android app with package: `com.example.gramaUrja`
4. Download the `google-services.json` file
5. Replace the placeholder file in `app/google-services.json`

### Step 2: Configure Realtime Database

In Firebase Console:
```
Realtime Database → Create Database → Start in Test Mode
Security Rules:
{
  "rules": {
    "zones": {
      "$zone": {
        ".read": true,
        ".write": true,
        "status": { ".validate": "newData.isBoolean()" },
        "timestamp": { ".validate": "newData.isNumber()" },
        "updatedBy": { ".validate": "newData.isString()" }
      }
    }
  }
}
```

### Step 3: Enable Cloud Messaging

- Firebase Console → Cloud Messaging
- Note your Server API Key for sending notifications

## Building the Project

### Option A: Using Android Studio

1. Open the project in Android Studio
2. Let Gradle sync automatically (File → Sync Now)
3. Build → Build Bundle(s) / APK(s) → Build APK(s)

### Option B: Using Terminal

```bash
cd GramaUrja
./gradlew build          # Build the project
./gradlew assemble       # Generate APK
./gradlew test           # Run tests
```

### Sync Gradle

```bash
./gradlew --refresh-dependencies
./gradlew clean build
```

## Running the App

1. **On Emulator**: 
   - Android Studio → Run → Select Emulator

2. **On Physical Device**:
   - Enable USB Debugging
   - `adb install app/build/outputs/apk/debug/app-debug.apk`

## Usage Guide

### 1. Zone Selection
- Launch app → Click "Change Zone"
- Select your transformer zone
- Confirm selection (saved locally)

### 2. Power Status Updates
- **Green Button**: Click to report power is ON
- **Red Button**: Click to report power is OFF
- Status broadcasts to all users in your zone within 2 seconds

### 3. Freshness Indicator
- Shows "Updated X mins ago"
- Updates every 30 seconds
- Live green dot indicates recent update

### 4. Pump Timer
- Select crop type (Rice, Wheat, Sugarcane, Cotton)
- Enter pump duration in minutes
- Timer counts down with notifications

## API Endpoints (Firebase Realtime Database)

```
zones/{zone_name}/
  ├── status (boolean)        - Current power status
  ├── timestamp (long)        - Last update time (ms)
  └── updatedBy (string)      - Who updated it ("User" or "System")
```

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Status Update Sync | < 2 seconds | ✅ |
| Data Freshness Display | Real-time | ✅ |
| UI Contrast Ratio | 7:1+ | ✅ |
| Font Size | 16sp+ | ✅ |
| App Response Time | < 500ms | ✅ |

## Dependencies

- `androidx.appcompat:appcompat:1.6.1`
- `androidx.constraintlayout:constraintlayout:2.1.4`
- `androidx.recyclerview:recyclerview:1.3.1`
- `com.google.android.material:material:1.10.0`
- `com.google.firebase:firebase-bom:32.5.0`
- `com.google.firebase:firebase-database`
- `com.google.firebase:firebase-messaging`
- `com.google.firebase:firebase-analytics`

## Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumented Tests (on device)
```bash
./gradlew connectedAndroidTest
```

## Troubleshooting

### Gradle Sync Issues
```bash
./gradlew clean
./gradlew --refresh-dependencies
```

### Firebase Connection Issues
- Verify `google-services.json` is in `app/` directory
- Check Firebase Realtime Database rules
- Ensure internet permission in AndroidManifest.xml

### Notification Issues
- Enable notifications in device settings
- Grant notification permissions (Android 13+)
- Check FCM device token registration

## Debugging

Enable verbose logging:
```bash
./gradlew build --debug
```

View logs:
```bash
adb logcat | grep "MainActivity\|FCM"
```

## Future Enhancements

- SMS notifications for feature phones
- Offline sync capability
- Solar panel status integration
- Water tank level monitoring
- Yield prediction based on irrigation data

## Success Criteria

- ✅ Status updates within 2 seconds
- ✅ Data freshness display working
- ✅ High-contrast UI for outdoor readability
- ✅ Push notifications on status change
- ✅ Pump timer utility functional

## Contributing

For bug reports and feature requests, contact the development team.

## License

© 2024 Grama-Urja Project. All rights reserved.

## Support

For issues or questions:
1. Check Firebase Console Realtime Database
2. Review logcat output
3. Verify device has internet connectivity
4. Check notification settings on device
