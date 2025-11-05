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

```bash
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
- Falls back to Gemini API if Chrome AI is unavailable
- **Automatic fallback categorization** if both AI services fail
- All data stored in your Google Drive
- No server, no database
- Client-side only

### AI Fallback System

The app has a three-tier fallback system for reliability:

1. **Primary**: Chrome Built-in AI (Gemini Nano via Prompt API) - Free, runs locally
2. **Secondary**: Gemini API (Gemini 1.5 Flash) - Requires API key, used when Chrome AI unavailable
3. **Tertiary**: Rule-based fallback categorization - Automatically categorizes notes using keyword detection when AI services fail

All three methods ensure your notes are always categorized, even if AI services are unavailable.

### AI Categorization

The app uses AI to automatically categorize notes with:

- **Titles**: Concise, descriptive titles (50-100 characters)
- **Summaries**: Detailed summaries (2-4 sentences, 100-300 characters)
- **Categories**: Hierarchical category paths (2-3 levels, PascalCase)
- **Tags**: Context-aware tags (1-2 words, lowercase, max 5)
- **Icons**: Category-relevant icons (lightbulb, link, code, shopping-cart, default)
- **Rationale**: Brief explanation of categorization decisions

#### Custom Instructions

You can customize how the AI categorizes notes by providing custom instructions. Custom instructions are combined with the base system instructions to ensure proper formatting while allowing customization.

**Security Features:**

- Prompt injection protection
- Content sanitization
- Rate limiting (5 requests/minute, 20/hour)
- Token usage optimization
- Spam detection
- Automatic fallback categorization when AI fails

**AI Validation & Testing:**

- Automated workflow validation test suite
- Chrome AI availability checks
- Schema validation for all AI responses
- Summary length validation (100-300 characters)
- Custom instructions integration testing
- Rate limiting behavior verification
- Error handling validation

See [PROMPT_ENGINEERING.md](PROMPT_ENGINEERING.md) for detailed information about prompt structure, validation, and testing.

## Usage

Type in the input area and press Enter. Notes are saved immediately and categorized automatically.

### Editing Notes

Click on any note to open the edit modal. You can:

- Edit the note content
- Save changes with Cmd/Ctrl + Enter
- Delete the note (with confirmation prompt)
- Cancel changes with ESC or the Cancel button

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
