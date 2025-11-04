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
3. Copy `.env.example` to `.env.local`
4. Add your Firebase configuration (required for Google authentication)
5. Optionally add a Gemini API key (only needed if Chrome's built-in AI isn't available)
6. Run `npm run dev`

## Configuration

### Firebase (Required)

Get your Firebase config from [Firebase Console](https://console.firebase.google.com/):

- Enable Google Sign-In
- Copy web app configuration values

Add to `.env.local`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## How It Works

- Uses Chrome's built-in AI (Gemini Nano) when available
- Falls back to Gemini API if needed
- All data stored in your Google Drive
- No server, no database
- Client-side only

## Usage

Type in the input area and press Enter. Notes are saved immediately and categorized automatically.

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
