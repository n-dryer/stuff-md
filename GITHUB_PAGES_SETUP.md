# GitHub Pages Setup Instructions

## ✅ Completed Steps

1. ✅ GitHub Actions workflow created (`.github/workflows/deploy-pages.yml`)
2. ✅ Vite configuration updated for GitHub Pages base path
3. ✅ Package.json updated with homepage URL
4. ✅ README updated with live demo link
5. ✅ Repository topics added
6. ✅ All changes committed and pushed

## 📋 Final Step: Enable GitHub Pages

To enable GitHub Pages and make your demo live, follow these steps:

### Option 1: Via GitHub Web Interface (Recommended)

1. Go to your repository: https://github.com/n-dryer/stuff-md
2. Click on **Settings** (top right of the repository page)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Save the settings

The workflow will automatically deploy your site when you push to the `main` branch.

### Option 2: Via GitHub CLI

If you prefer using the command line, run:

```bash
gh api repos/n-dryer/stuff-md/pages -X POST \
  -H "Accept: application/vnd.github+json" \
  -f source[type]=actions
```

## 🚀 After Enabling Pages

Once GitHub Pages is enabled:

1. **Wait for the workflow to run**: Go to the **Actions** tab in your repository
2. **Check deployment status**: The workflow should build and deploy automatically
3. **Access your demo**: Your site will be available at:
   - https://n-dryer.github.io/stuff-md

## 📝 Notes

- The deployment workflow runs automatically on every push to `main`
- You can also trigger it manually from the Actions tab
- The build uses GitHub Actions artifacts (no `gh-pages` branch needed)
- Your demo may need Firebase/Gemini API keys to work fully - users can add their own in `.env.local` when cloning

## 🔧 Troubleshooting

If the deployment fails:

1. Check the **Actions** tab for error messages
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow file is correct: `.github/workflows/deploy-pages.yml`
4. Check that the build completes successfully

## 🌐 Your Demo URL

Once deployed, your demo will be available at:
**https://n-dryer.github.io/stuff-md**

You can add this link to your README, repository description, or anywhere else you'd like to share it!

