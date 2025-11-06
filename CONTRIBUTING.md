# Contributing to STUFF.MD

Thank you for your interest in contributing to STUFF.MD! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/stuff-md.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and add your Firebase configuration
5. Run the dev server: `npm run dev`

## Development Workflow

1. Create a branch from `main` for your changes
2. Make your changes following the [style guide](STYLE_GUIDE.md)
3. Test your changes locally
4. Ensure all checks pass:
   - `npm run lint` - No linting errors
   - `npm run format:check` - Code is properly formatted
   - `npm run type-check` - No TypeScript errors
5. Commit your changes with clear, descriptive commit messages
6. Push to your fork and create a pull request

## Pull Requests

- Create a branch from `main`
- Keep changes focused on a single feature or fix
- Include a clear description of what changed and why
- Ensure all tests pass and linting is clean
- Update documentation if needed

## Reporting Issues

- Use GitHub issues to report bugs or suggest features
- Include steps to reproduce bugs
- Include relevant environment details (browser, OS, etc.)
- Check existing issues before creating a new one

## Code Style

Please follow the coding standards outlined in [STYLE_GUIDE.md](STYLE_GUIDE.md).

## Questions?

If you have questions, feel free to open an issue for discussion.
