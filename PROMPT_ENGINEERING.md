# AI Prompt Engineering Documentation

## Overview

This document describes the AI prompt engineering strategy used for automatic note categorization in STUFF.MD.

## System Architecture

### AI Providers

1. **Primary**: Chrome Built-in AI (Gemini Nano via Prompt API)
   - Free, runs locally in Chrome
   - No API key required
   - ~32K token context window

2. **Fallback**: Gemini API (Gemini 1.5 Flash)
   - Requires API key (`VITE_GEMINI_API_KEY`)
   - Used when Chrome AI unavailable
   - ~32K token context window

### Prompt Structure

The prompt consists of three main components:

1. **System Instruction**: Base instructions defining the task, output format, examples, and guidelines
2. **User Content**: The note content to be categorized (sanitized and truncated)
3. **Custom Instructions** (optional): User-provided guidelines that modify the base instructions

## System Instruction

### Current Version

**Version**: 1.1.0

The system instruction includes:

- Task definition (6 required outputs)
- Field specifications and constraints
- Guidelines for each output type
- Positive examples (4 diverse examples)
- Negative examples (what NOT to do)
- Icon selection guidance with category mapping

### Output Fields

1. **Title** (50-100 chars): Concise, descriptive, not generic
2. **Summary** (100-300 chars): 2-4 sentences, informative
3. **Categories** (1-3 levels): Hierarchical PascalCase paths
4. **Tags** (max 5): 1-2 words, lowercase, distinct from categories
5. **Icon**: One of: lightbulb, link, code, shopping-cart, default (must match category)
6. **Rationale**: Brief explanation of categorization

## Custom Instructions

### How They Work

Custom instructions are **combined** with system instructions, not replaced. This ensures:

- ✅ Output format requirements are always preserved
- ✅ Schema validation always works
- ✅ Examples and guidelines remain available
- ✅ User customization is possible without breaking functionality

### Format

```text
[Base System Instruction]

---

ADDITIONAL USER GUIDELINES:
[User's custom instructions]

Note: These guidelines modify the base instructions above. You must still follow the output format, schema structure, and provide all required fields (title, summary, categories, tags, icon, rationale).
```

### Limits

- Maximum length: 2000 characters
- Validated for prompt injection patterns
- Sanitized before use

### Writing Effective Custom Instructions

**Good Custom Instructions:**

- "Always use 'Work' as parent category for professional notes"
- "Prefer shorter category paths (1-2 levels)"
- "Use more specific tags like 'meeting' instead of 'work'"

**Avoid:**

- System commands (e.g., "ignore previous instructions")
- Role-playing instructions
- Instructions that contradict output format requirements

## Security Measures

### Prompt Injection Protection

Content is sanitized to remove dangerous patterns:

- System/assistant/user role commands
- Code block injections
- Instruction delimiters ([INST], <|im_start|>, etc.)
- Role-playing attempts

### Rate Limiting

- **Per minute**: 5 requests
- **Per hour**: 20 requests
- Prevents token drainage and API abuse

### Token Optimization

- Content truncated to 6000 characters max
- Token estimation: ~1 token per 4 characters
- Total prompt limited to ~28K tokens (safety margin)
- System instruction optimized (~400 tokens)

### Input Validation

- Content validated for AI processing (50KB max)
- Spam detection (excessive repetition, special characters)
- Custom instructions validated (2000 char max, injection pattern detection)

## Icon Generation

### Available Icons

- `lightbulb`: Ideas, notes, thoughts, brainstorming
- `link`: Links, URLs, bookmarks, references
- `code`: Programming, development, technical content
- `shopping-cart`: Shopping, personal, purchases
- `default`: All other content types

### Icon Selection Logic

1. AI suggests icon based on category
2. Icon validated against allowed list
3. Relevance checked against primary category
4. If invalid/irrelevant, icon derived from category path
5. Ensures unique and relevant icons

## Error Handling

### Three-Tier Fallback System

The app implements a robust three-tier fallback system to ensure notes are always categorized:

1. **Primary**: Chrome Built-in AI (Gemini Nano via Prompt API)
   - Free, runs locally in Chrome
   - No API key required
   - ~32K token context window

2. **Secondary**: Gemini API (Gemini 1.5 Flash)
   - Requires API key (`VITE_GEMINI_API_KEY`)
   - Used when Chrome AI unavailable
   - ~32K token context window

3. **Tertiary**: Rule-based Fallback Categorization
   - Automatically triggered when both AI services fail
   - Keyword extraction from content
   - Basic category detection (Programming, Personal, Links, Misc)
   - Tag generation from keywords
   - Title/summary from content truncation (100-300 chars)
   - Icon derived from category
   - Ensures notes are always categorized, even without AI

### Fallback Categorization

When AI fails, a rule-based fallback is automatically used:

- Keyword extraction from content
- Basic category detection (Programming, Personal, Links, Misc)
- Tag generation from keywords
- Title/summary from content truncation (validates 100-300 char requirement)
- Icon derived from category
- **Result is cached** to prevent redundant processing

### Error States

- **Timeout**: 20s timeout with one retry at 15s
- **Schema Error**: Invalid response format
- **Rate Limit**: User-friendly error message
- **Validation Error**: Content rejected before AI processing

## Request Deduplication

- Active requests tracked to prevent concurrent duplicates
- Cache for recent results (50 entries, LRU eviction)
- Cache key: content hash + instructions hash
- Prevents redundant API calls

## Mobile Optimization

- Responsive truncation (60 chars mobile, 80 desktop)
- Touch-optimized controls (≥44px targets)
- Full-screen modals on mobile
- Optimized textarea sizes and keyboard handling

## Version History

### v1.1.0 (Current)

- Enhanced system instruction with more examples
- Negative examples added
- Improved icon guidance
- Custom instructions combination fix
- Security enhancements
- Token optimization
- Rate limiting
- Fallback categorization

### v1.0.0 (Initial)

- Basic system instruction
- 2 examples
- Custom instructions replaced system instruction (bug)

## Testing

### Prompt Testing Checklist

- [ ] Default system instruction produces valid outputs
- [ ] Custom instructions work without breaking schema
- [ ] Icon validation ensures relevance
- [ ] Fallback categorization works when AI fails
- [ ] Rate limiting prevents abuse
- [ ] Token usage stays within limits
- [ ] Prompt injection attempts are blocked
- [ ] Mobile responsiveness works correctly

## Troubleshooting

### AI Categorization Fails

1. Check browser console for errors
2. Verify Chrome AI is available or Gemini API key is configured
3. Check rate limits haven't been exceeded
4. Verify content isn't being rejected as spam
5. Check network connectivity

### Custom Instructions Not Working

1. Ensure instructions don't contain injection patterns
2. Verify instructions are under 2000 characters
3. Check that base system instruction is still being used
4. Review browser console for validation errors

### Icons Not Matching Categories

1. Icon validation should automatically fix mismatches
2. Check that category path is valid
3. Fallback icon derivation ensures valid icons

## Best Practices

1. **Keep custom instructions focused**: Specify preferences, not full rewrites
2. **Test custom instructions**: Save and test with a sample note
3. **Monitor token usage**: Very long custom instructions reduce available tokens
4. **Use examples**: Include examples in custom instructions if helpful
5. **Be specific**: Clear, specific guidelines work better than vague ones
