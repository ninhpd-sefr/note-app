# 📝 Note App

**Note App** is a personal note-taking application designed to help users manage their daily tasks, ideas, and notes in a visual and convenient way. It is especially suited for busy individuals who need to jot things down frequently and access information anytime, anywhere.

With Note App, you can do more than just write notes. You can group them by topics, protect sensitive information with a PIN, attach images, pin important notes, and even draw directly on images. The app is built on **React Native + Expo**, making it easy to deploy on both Android and iOS.

## 🎯 App Objectives

- Help users take notes quickly anytime, anywhere
- Organize personal tasks visually and systematically
- Secure sensitive notes with a passcode
- Provide a clean, user-friendly mobile interface

## ⚡ Highlights

- ✅ Modern UI with smooth performance
- ✅ Data sync with Firebase
- ✅ User authentication via Email, Google, Facebook
- ✅ Notes can include text and images
- ✅ List or Grid view modes
- ✅ Draw directly on images using Skia
- ✅ Lock notes with a 6-digit PIN
- ✅ Toasts and UI feedback work even with modals open
- ✅ State management with Context API

## 🚀 Features

### 🔑 User Authentication
- Sign up with **email and password**
- Login with:
  - Email / password
  - Social accounts: **Google**, **Facebook** (OAuth2)
- Integrated with **Firebase Authentication**

### 🗂️ Note Group Management
- Create new note groups
- Rename existing groups
- Delete note groups
- Each note belongs to a specific group

### 📝 Note Management
- Create notes with text and images
- Edit note content
- Delete notes
- Move notes between groups
- Pin important notes
- Lock notes with a 6-digit PIN

### 🔍 Search & Display
- Search notes by keyword
- View notes in **list** or **grid** mode
- Pagination to optimize data loading

### 🖼️ Advanced Features
- Draw and edit directly on images (Skia)
- Auto **retry on network loss** (NetInfo)
- Toasts work even when modals are shown

## ⚙️ Setup & Run

> **Requirements:** You need to have [Node.js](https://nodejs.org), [Expo CLI](https://docs.expo.dev/get-started/installation/), and use either `npm` or `yarn`.

### 1. Clone the project

```bash
git clone https://github.com/ninhpd-sefr/note-app.git
cd note-app
```

### 2. Install dependencies

```bash
# With npm
npm install

# Or with yarn
yarn install
```

### 3. Run the app

```bash
# Run app with Expo Dev Client
npm run start

# Or run on Android / iOS separately
npm run android
npm run ios
```

> ⚠️ Make sure you have enabled the following services in Firebase Console: Authentication, Firestore

## 📂 Project Structure

```bash
note-app/
└── src/
    ├── assets/                 # Icons, placeholder images, etc.
    ├── components/             # Reusable UI components
    ├── context/                # Context API: Note, Session, Auth...
    ├── hooks/                  # Custom React hooks
    ├── screens/                # Main screens (Home, Group, Detail...)
    ├── services/               # Firebase/Auth service logic
    ├── utils/                  # Utility functions (network check, etc.)
```

## 🧰 Technologies

**Frontend**:  
- React Native (Expo)  
- Context API
- React Native Paper, Modal  
- React Native Skia   
- Toast Message, ViewShot  
- NetInfo, Axios. 
**Backend (via Firebase)**:  
- Firebase Authentication (Email, Google, Facebook)  
- Firestore Database (notes & groups)  
- Cloudinary (image uploads) 

## 👤 Author

**Pham Dang Ninh** — [https://github.com/ninhpd-sefr](https://github.com/ninhpd-sefr)

## 📄 License

**No reuse of source code is permitted.**
