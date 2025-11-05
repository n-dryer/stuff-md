# Chrome AI Validation Guide

## Overview

This document describes how to validate that the Chrome AI (Prompt API) implementation is working correctly in STUFF.MD.

## Implementation Status

The Chrome AI implementation follows the [Chrome AI Built-in APIs documentation](https://developer.chrome.com/docs/ai/built-in-apis):

✅ **Correctly implemented:**

- Uses `window.ai.canCreateTextSession()` for availability checks
- Uses `window.ai.createTextSession()` for session creation
- Handles all three availability states: `'readily'`, `'after-download'`, and `'no'`
- Includes system instructions and JSON schema in prompt text (as required by Prompt API)
- Proper error handling and logging
- Comprehensive validation of AI responses

## Validation Requirements

The AI must generate valid outputs with these constraints:

1. **Title**: 10-100 characters, informative, not generic
2. **Summary**: 100-300 characters, 2-4 sentences, informative
3. **Categories**: Array of 1-3 strings, hierarchical PascalCase paths
4. **Tags**: Array of up to 5 strings, 1-2 words each, lowercase
5. **Icon**: One of: `lightbulb`, `link`, `code`, `shopping-cart`, `default`
6. **Rationale**: 10-200 characters, brief explanation

## Testing Methods

### Method 1: Browser Console Test (Recommended)

1. Open the app in Chrome (Chrome 138+ for extensions, or with origin trial for web)
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run:

```javascript
await window.__STUFF_TEST_AI__();
```

This will:

- Check Chrome AI availability
- Test categorization with sample content
- Validate all output fields
- Report pass/fail status

### Method 2: Manual Test

1. Create a new note with test content:

   ```
   React hooks tutorial: useState and useEffect basics for managing component state
   ```

2. Save the note
3. Check the console for Chrome AI logs (in dev mode)
4. Verify the note has:
   - ✅ Valid title (10-100 chars)
   - ✅ Valid summary (100-300 chars)
   - ✅ Valid categories (1-3 items)
   - ✅ Valid tags (up to 5 items, 1-2 words each)
   - ✅ Valid icon (matches category)
   - ✅ Valid rationale (10-200 chars)

### Method 3: Check Console Logs

In development mode, the console will show detailed Chrome AI logs:

```
[Chrome AI] Starting Chrome built-in AI request
[Chrome AI] Availability check returned: readily
[Chrome AI] Availability: readily
[Chrome AI] Attempting to create text session...
[Chrome AI] Session created successfully
[Chrome AI] Constructing prompt with schema...
[Chrome AI] Sending prompt to session...
[Chrome AI] Received response, cleaning...
[Chrome AI] Successfully processed response
[Chrome AI] Destroying session
[AI Service] Using Chrome built-in AI (Gemini Nano)
[AI Service] Successfully categorized: [title]
```

## Troubleshooting

### Chrome AI Not Available

**Possible reasons:**

1. Not using Chrome browser
2. Chrome version < 138 (for extensions)
3. Origin trial not enrolled (for web usage)
4. Chrome AI flags not enabled
5. Gemini Nano model not downloaded

**Solutions:**

- Check Chrome version: `chrome://version`
- For web: Enroll in origin trial at https://developer.chrome.com/origintrials/#/view_trial/2533837740349325313
- For extensions: Ensure Chrome 138+ is installed
- Check flags: `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`
- Enable built-in AI: `chrome://flags/#enable-built-in-ai`

### Validation Failures

If validation fails, check:

1. **Summary length**: Must be 100-300 characters. The AI sometimes returns shorter summaries.
2. **Title length**: Must be 10-100 characters.
3. **Categories**: Must be 1-3 items, PascalCase.
4. **Tags**: Must be 1-2 words each, max 5 tags.
5. **Icon**: Must match category and be one of the allowed values.

The system includes fallback mechanisms:

- Summary enhancement if too short
- Icon derivation from category if invalid
- Fallback categorization if AI fails completely

## Expected Behavior

When Chrome AI is working correctly:

1. **Availability**: Returns `'readily'` or `'after-download'`
2. **Session Creation**: Successfully creates session
3. **Prompt Execution**: Returns valid JSON response
4. **Validation**: All fields pass validation
5. **Result**: Note is categorized with proper title, summary, categories, tags, icon, and rationale

## Fallback Behavior

If Chrome AI is unavailable:

- Falls back to Gemini API (if API key configured)
- Falls back to rule-based categorization (if both fail)
- All fallbacks still produce valid outputs

## Testing Checklist

- [ ] Chrome AI availability check works
- [ ] Session creation succeeds
- [ ] Prompt execution returns valid JSON
- [ ] Title is 10-100 characters, informative
- [ ] Summary is 100-300 characters, 2-4 sentences
- [ ] Categories are 1-3 items, PascalCase
- [ ] Tags are up to 5 items, 1-2 words each, lowercase
- [ ] Icon matches category and is valid
- [ ] Rationale is 10-200 characters
- [ ] Error handling works for unavailable AI
- [ ] Fallback to Gemini API works
- [ ] Fallback categorization works

## References

- [Chrome AI Built-in APIs](https://developer.chrome.com/docs/ai/built-in-apis)
- [Prompt API Documentation](https://developer.chrome.com/docs/ai/prompt-api)
- [Origin Trial Enrollment](https://developer.chrome.com/origintrials/#/view_trial/2533837740349325313)
