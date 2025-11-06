# STUFF.MD

A notepad that saves to Google Drive. Notes are automatically categorized by AI.

🌐 **Live Demo:** [https://n-dryer.github.io/stuff-md](https://n-dryer.github.io/stuff-md)

## What It Does

You type notes. They get saved to your Google Drive. AI categorizes them in the background. That's it.

## Features

- Saves notes directly to your Google Drive
- AI automatically categorizes and tags notes
- Search and filter by content, category, tags, or date
- Grid and table view modes
- Export as TXT, JSON, or ZIP
- Dark mode
- Keyboard navigation

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your configuration (see below).
4. Run `npm run dev`

## Configuration

### Firebase Authentication (Required)

**Note:** Firebase is **only** used for Google Authentication. You can deploy this project to any static hosting platform (Vercel, Netlify, GitHub Pages, etc.). The `firebase.json` file is optional and only for those who choose to deploy to Firebase Hosting.

Get your Firebase config from the [Firebase Console](https://console.firebase.google.com/):

1. Create a new Firebase project.
2. Add a Web App to your project.
3. Enable Google Sign-In in the "Authentication" section.
4. Copy your web app's configuration values into `.env.local`.

### Google Drive API Setup (Required)

The app saves all notes to your personal Google Drive. You must enable the Google Drive API in your Google Cloud project.

1. **Go to Google Cloud Console:** Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. **Select your Firebase project.**
3. **Enable API:** Go to **APIs & Services > Library**, search for "Google Drive API", and click **Enable**.
4. **Configure OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**.
   - Set **User Type** to **External**.
   - Fill in the required app details (app name, user support email).
   - On the "Scopes" page, click "Add or Remove Scopes", and add the `https://www.googleapis.com/auth/drive.file` scope.
   - If your app is in "Testing" mode, add your Google account email to the "Test users" list.

## How It Works

### Storage Backend (Google Drive)

**Current Implementation:** Google Drive is the only supported storage backend.

All notes are stored in your personal Google Drive in a dedicated folder named **"STUFF.MD Notes"**, which is created automatically.

- **Privacy**: The app uses a restricted scope (`drive.file`) that only allows it to access files it creates. It **cannot** see or access any of your other files in Google Drive.
- **User Ownership**: Your data stays in your own Google Drive account. This project does not use any external databases.

### AI Categorization Setup

The app uses a three-tier AI system for reliability:

1. **Primary**: Chrome Built-in AI (Gemini Nano) - Free, runs locally via Chrome's Prompt API.
2. **Secondary**: Gemini API - Requires an API key in `.env.local`, used when Chrome AI is unavailable.
3. **Tertiary**: Rule-based fallback - Basic categorization when no AI services are available.

#### Option 1: Chrome Built-in AI (Recommended for Free Usage)

To use Chrome's built-in AI, you need to register for the Prompt API origin trial:

1. **Register for Origin Trial:**
   - Visit: [Chrome Origin Trials - Prompt API](https://developer.chrome.com/origintrials/#/view_trial/2533837740349325313)
   - Sign in with your Google account
   - Register your origin:
     - For **production**: Enter your domain (e.g., `https://yourdomain.com`)
     - For **local development**: Enter `http://localhost:3000` (or your dev port)
   - Enable "Third party" if you plan to embed the app
   - Enable "Match subdomains" if you want it to work on subdomains
   - Submit and copy your token

2. **Add Token to HTML:**
   - Open `index.html`
   - Add your origin trial token(s) in the `<head>` section:
     ```html
     <!-- Origin Trial Token for your domain -->
     <meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE" />
     ```
   - You can add multiple tokens (one for production, one for localhost)
   - **Note**: The production token in this repo is for the demo site only. You'll need to register your own token for your domain.

3. **Requirements:**
   - Chrome 139+ (or Chrome Canary)
   - Windows 10/11, macOS 13+, Linux, or ChromeOS
   - 22GB free disk space, 16GB RAM, 4GB VRAM, 4 CPU cores
   - Restart Chrome after adding the token

#### Option 2: Gemini API Fallback (Easier Setup)

If you don't want to set up origin trial tokens, you can use the Gemini API as a fallback:

1. **Get a Gemini API Key:**
   - Visit: [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key (starts with `AIza...`)

2. **Add to `.env.local`:**
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

The app will automatically use Chrome AI if available, otherwise it will fall back to the Gemini API. If both are unavailable, it uses the rule-based fallback.

**Note**: The Gemini API has usage limits and may incur costs for high-volume usage. Chrome Built-in AI is free but requires origin trial enrollment.

All data is stored in your Google Drive. No server, no database. Client-side only.

## Usage

Type in the input area and press Enter. Notes are saved immediately and categorized automatically.

Click on any note to edit. Save with Cmd/Ctrl + Enter, delete with confirmation, or cancel with ESC.

## Tech Stack

- React + TypeScript
- Firebase (authentication)
- Google Drive API (storage)
- Chrome Built-in AI / Gemini API (categorization)
- Tailwind CSS (styling)
- Vite (build tool)

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Unlicense - free for personal and commercial use.

See [LICENSE](LICENSE) for details.
