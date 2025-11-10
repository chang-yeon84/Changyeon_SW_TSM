# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TSM_APP is a monorepo containing a React Native mobile application (client) and Express.js backend (server) for managing travel schedules. The app uses Naver OAuth for authentication.

**Important**: This is a mobile-only application. While Expo supports web, this project is optimized for Android/iOS only.

## Repository Structure

```
tsm_app/
├── client/          # React Native/Expo mobile app
│   ├── app/         # Expo Router screens (file-based routing)
│   ├── components/  # Reusable UI components
│   ├── contexts/    # React contexts for state management
│   └── assets/      # Images and static files
└── server/          # Express.js backend
    └── src/
        ├── config/      # Database configuration
        ├── models/      # Mongoose data models
        ├── routes/      # API route handlers
        ├── controllers/ # Business logic (currently empty)
        ├── middlewares/ # Express middlewares (currently empty)
        └── utils/       # Utility functions (currently empty)
```

## Development Commands

### Client (React Native/Expo)
```bash
cd client
npm install              # Install dependencies
npm start               # Start Expo development server
npm run android         # Run on Android emulator/device (primary)
npm run ios            # Run on iOS simulator/device
npm run lint           # Run ESLint
npx expo start --clear # Clear cache and start

# Note: Do NOT use 'npm run web' - this app is mobile-only
```

### Server (Express.js)
```bash
cd server
npm install            # Install dependencies
npm run dev           # Start development server with nodemon (auto-reload)
npm start             # Start production server
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
```

### Environment Setup
- **Required Node.js version**: 22.20.0 (specified in client README)
- **Client**: Create `.env` file if needed for API endpoints
- **Server**: Create `.env` file with:
  - `MONGODB_URI` - MongoDB connection string
  - `NAVER_CLIENT_ID` - Naver OAuth client ID
  - `NAVER_CLIENT_SECRET` - Naver OAuth client secret
  - `PORT` - Server port (default: 5000)

## Architecture

### Client Architecture

The client uses **Expo Router** for file-based routing. Each file in `app/` automatically becomes a route:
- `index.js` → Login screen (/)
- `home.js` → Home screen (/home)
- `sch_list.js` → Schedule list (/sch_list)
- `sch_detail.js` → Schedule details (/sch_detail)
- `sch_add.js` → Add schedule (/sch_add)
- `recom.js` → Recommendations (/recom)
- `profile.js` → User profile (/profile)

**Navigation**:
- Uses `NavigationContext` to track active tab state across the app
- Bottom navigation bar implemented in `components/btn_btm_nav_bar.js`
- Navigation state is shared via React Context API

**Deep Linking**:
- Custom URL scheme: `tsmapp://`
- Used for OAuth callback: `tsmapp://auth/callback?userId=...&accessToken=...`

### Server Architecture

Standard Express.js MVC structure:
- **Routes** (`src/routes/`) define API endpoints
- **Models** (`src/models/`) define MongoDB schemas using Mongoose
- **Config** (`src/config/`) handles database connections

**Current API Endpoints**:
- `GET /api/auth/naver/callback` - Handles Naver OAuth callback
  - Creates/finds user in database
  - Returns different response based on platform (web vs mobile)
  - Web: Redirects to `/home`
  - Mobile: Uses deep link `tsmapp://auth/callback`

**Database**:
- MongoDB with Mongoose ODM
- Current models: `User` (naverId, name, email, profileImage, status)

## Key Features

### Authentication Flow
1. User initiates Naver login from client
2. Naver OAuth redirects to server `/api/auth/naver/callback`
3. Server exchanges code for access token
4. Server fetches user info from Naver API
5. Server creates/updates user in MongoDB
6. Server responds differently based on platform:
   - **Web**: HTML redirect to home page
   - **Mobile**: Deep link redirect to app

### Platform Detection
The server detects platform by checking:
- Referer header (localhost:8081, localhost:19006, 192.168.0.4:8081)
- User-Agent (Chrome, Firefox, Safari)

## Common Development Tasks

### Adding a new screen
1. Create new file in `client/app/` (e.g., `new_screen.js`)
2. Add corresponding entry in `client/app/_layout.js`:
   ```jsx
   <Stack.Screen name="new_screen" />
   ```
3. Navigate using Expo Router: `router.push('/new_screen')`

### Adding a new API endpoint
1. Create route handler in `server/src/routes/` or add to existing route
2. Register route in `server/src/server.js`:
   ```javascript
   app.use('/api/endpoint', require('./routes/endpoint'));
   ```
3. If needed, create model in `server/src/models/`

### Testing on Android
1. Ensure Android Studio and SDK are installed
2. Create/start Android emulator via AVD Manager
3. Run `npm run android` from client directory
4. Or use physical device with USB debugging enabled

## Tech Stack

### Client
- **Framework**: React Native 0.81.4
- **Expo SDK**: ~54.0.10
- **Routing**: Expo Router ~6.0.8
- **UI**: React Native components, Expo Linear Gradient
- **Navigation**: React Navigation (Bottom Tabs)
- **HTTP**: Axios ^1.13.1
- **Auth**: @react-native-seoul/naver-login
- **Storage**: @react-native-async-storage/async-storage

### Server
- **Runtime**: Node.js (Express 5.1.0)
- **Database**: MongoDB (Mongoose 8.19.2)
- **Authentication**: Naver OAuth 2.0
- **Middleware**: CORS, dotenv
- **Dev Tools**: Nodemon (auto-reload)
- **Linting**: ESLint (Airbnb config)

## Important Notes

- Client runs on Node.js 22.20.0 specifically
- Server port defaults to 5000 (configurable via `.env`)
- MongoDB connection must be configured in `.env` before running server
- Naver OAuth credentials required for authentication to work
- The commented-out schedules route in server.js suggests this feature is planned but not yet implemented
