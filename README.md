# 🛡️ Focused

**Focused** is a powerful productivity application designed to help you reclaim your time and minimize digital distractions. Unlike standard focus timers, Focused employs robust, native-level blocking mechanisms to ensure you stay on task.

## ✨ Key Features

- **Strict App Blocking**: Blocks distracting apps immediately when you try to open them during a session.
- **🛡️ Unbreakable Security**:
  - **Restart Protection**: Sessions persist even if you restart your phone. The blocker automatically resumes immediately after boot.
  - **Uninstall Protection**: Uses 'Device Administrator' privileges to prevent the app from being easily uninstalled during an active session.
- **Emergency Key System**: Users are given a limited number of "Emergency Keys" to pause a session, discouraging frequent quitting.
- **Customizable Duration**: Set your focus sessions for any duration that fits your workflow.
- **Whitelisting**: Select which apps are allowed (e.g., Phone, Calculator) while blocking everything else.
- **Premium Aesthetics**: A beautiful, dark-themed UI built with smooth animations and glassmorphism effects.

## 🏗️ Tech Stack

Built with modern mobile technologies:
- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Managed Workflow with Prebuild)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistence)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Native Modules**: Custom Kotlin modules for:
  - Checking & Requesting Permissions (Overlay, Usage Stats, Device Admin)
  - Handling `BOOT_COMPLETED` broadcasts
  - Foreground Service for active monitoring

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YashmeetSingh-portfolio/Focused.git
    cd Focused
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Build the Android App**
    Since this project uses custom native code, you cannot use Expo Go. You must build the native client.
    ```bash
    npx expo run:android
    ```

## 🔐 Permissions Explained

Focused requires sensitive permissions to function effectively:

1.  **Display Over Other Apps (Overlay)**: To show the "Focus Screen" immediately when a blocked app is opened.
2.  **Usage Access**: To detect which application is currently running in the foreground.
3.  **Device Administrator**: To prevent the app from being force-stopped or uninstalled while a timer is running.
4.  **Receive Boot Completed**: To restart the blocking service instantly if the phone is rebooted.

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

built with ❤️ by [Yashmeet Singh](https://github.com/YashmeetSingh-portfolio)
