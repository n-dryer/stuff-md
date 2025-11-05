# Static Asset Caching

## Current State

### Asset Hashing
All static assets (JavaScript and CSS files) are built with content-based hashes in their filenames by Vite. This provides automatic cache-busting when files change.

Example filenames:
- `genai-yGw2w2Yu.js` - Content hash: `yGw2w2Yu`
- `index-CHZF3Uhu.css` - Content hash: `CHZF3Uhu`
- `react-vendor-D_zojjDM.js` - Content hash: `D_zojjDM`

### GitHub Pages Limitations
GitHub Pages does not support custom HTTP headers (like `Cache-Control`). This means:
- No ability to set explicit cache policies via `_headers` file (Netlify-style)
- No `.htaccess` support (Apache-style)
- No custom headers via GitHub Actions workflow

The platform uses default browser caching behavior, which may not be optimal for static assets.

## Impact

### Positive Aspects
- **Content hashing works**: When files change, the hash changes, forcing browsers to fetch new versions
- **Cache-busting is automatic**: No need to manually invalidate caches when deploying updates
- **Browser caching**: Modern browsers will still cache assets based on their own heuristics

### Limitations
- **No explicit cache headers**: Browsers may not cache as aggressively as desired
- **Performance audit warnings**: Tools like Lighthouse may flag missing cache headers
- **No long-term caching policy**: Cannot set `max-age=31536000, immutable` for hashed assets

## Solutions

### Option 1: Use Firebase Hosting (Recommended)
Firebase Hosting supports custom cache headers via `firebase.json`. The project already has this configuration:

```json
{
  "headers": [
    {
      "source": "**/*.@(js|css|woff2|woff|ttf|eot)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**To migrate:**
1. Deploy to Firebase Hosting instead of GitHub Pages
2. Cache headers will be automatically applied
3. All hashed assets will be cached for 1 year

### Option 2: Accept GitHub Pages Limitations
- Content hashing already provides cache-busting
- Browser default caching is still effective
- Performance impact is minimal for most users
- No configuration changes needed

### Option 3: Use a CDN Proxy
- Deploy behind a CDN (Cloudflare, etc.) that supports custom headers
- More complex setup
- Additional cost may apply

## Recommendation

For optimal caching performance, consider migrating to Firebase Hosting, which:
1. Supports custom cache headers
2. Already has configuration in place
3. Provides similar or better performance than GitHub Pages
4. Maintains the same deployment workflow

The current setup with GitHub Pages is functional and acceptable, but Firebase Hosting would resolve the caching audit warning completely.

