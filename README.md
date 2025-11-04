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

### Gemini API (Optional)

Only needed if Chrome's built-in AI isn't available. Get from [Google AI Studio](https://aistudio.google.com/app/apikey):

```
VITE_GEMINI_API_KEY=your_gemini_api_key
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

## Security

### Content Security Policy (CSP)

The application uses a Content Security Policy to prevent XSS attacks. The current CSP includes `'unsafe-inline'` for scripts to support Vite's Hot Module Replacement (HMR) during development and the importmap functionality.

**For production deployments**, consider hardening the CSP by:

1. Using nonces or script hashes instead of `'unsafe-inline'`
2. Implementing a build-time CSP generator that analyzes your bundles
3. Using a CSP report-only mode initially to validate your policy

The CSP configuration is in `index.html` and can be customized for your deployment.

### Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: DOMPurify sanitizes markdown content before rendering
- **URL Validation**: Only safe URL schemes (http, https, mailto, tel, sms) are allowed
- **Rate Limiting**: Client-side rate limiting prevents spam operations
- **Error Sanitization**: Error messages are sanitized to prevent information disclosure
- **Token Storage**: Access tokens stored in sessionStorage (client-side only)

### Production Hardening Recommendations

1. **CSP**: Replace `'unsafe-inline'` with nonces or hashes
2. **Environment Variables**: Never commit `.env.local` - ensure `.gitignore` is configured
3. **Dependencies**: Regularly update dependencies and run security audits (`npm audit`)
4. **HTTPS**: Always serve the application over HTTPS in production
5. **Monitoring**: Consider adding error monitoring and CSP violation reporting

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Unlicense - free for personal and commercial use.

See [LICENSE](LICENSE) for details.
