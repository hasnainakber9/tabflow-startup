# Contributing to TabFlow

Thank you for your interest in contributing to TabFlow! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search to see if the bug has already been reported
2. **Create detailed report** - Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Browser version and OS

### Suggesting Features

1. **Check roadmap** - See if feature is already planned
2. **Create feature request** - Include:
   - Clear use case
   - Expected behavior
   - Why this would benefit users
   - Mockups or examples if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a branch** - Use descriptive name: `feature/intent-voice-input` or `fix/tab-grouping-bug`
3. **Make your changes**
4. **Test thoroughly** - Ensure no regressions
5. **Commit with clear message** - Follow conventional commits:
   - `feat: add voice input for intents`
   - `fix: resolve tab grouping color issue`
   - `docs: update installation guide`
6. **Push to your fork**
7. **Open pull request** - Provide clear description of changes

## Development Setup

### Prerequisites

- Node.js 18+
- Chrome Browser 88+
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/tabflow-startup.git
cd tabflow-startup

# Create a branch
git checkout -b feature/your-feature-name

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the extension folder

# Make your changes
# Test in Chrome

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## Coding Standards

### JavaScript Style Guide

- Use ES6+ syntax
- Use `const` and `let`, avoid `var`
- Use async/await over promises
- Use template literals for strings
- Add comments for complex logic
- Use meaningful variable names

**Example:**

```javascript
// Good
const intentText = document.getElementById('intentInput').value;
const category = await getSelectedCategory();

// Avoid
var text = document.getElementById('intentInput').value;
getSelectedCategory().then(cat => { /* ... */ });
```

### HTML/CSS Standards

- Use semantic HTML5 elements
- Use CSS variables for colors
- Mobile-first responsive design
- Follow BEM naming convention for CSS classes

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(intent): add voice input support

Implements voice recognition API for hands-free intent creation.
Includes recording animation and error handling.

Closes #42
```

```
fix(tabs): resolve grouping color mismatch

Category colors now correctly match between intent card and tab group.

Fixes #89
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting PR, test:

- [ ] New tab loads correctly
- [ ] Intent can be created
- [ ] Category selection works
- [ ] Tab grouping functions
- [ ] Stats update correctly
- [ ] Settings persist
- [ ] No console errors
- [ ] Works in incognito mode

### Browser Testing

Test in:
- Chrome (latest)
- Chrome (one version back)
- Edge (Chromium-based)

## Documentation

### When to Update Docs

- Adding new features
- Changing existing behavior
- Adding new configuration options
- Updating dependencies

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update README.md if needed
- Keep CHANGELOG.md updated

## Community

### Getting Help

- **Discord**: [Join our community](https://discord.gg/tabflow)
- **GitHub Discussions**: Ask questions
- **Email**: dev@tabflow.app

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked on Twitter
- Eligible for swag (coming soon!)

## License

By contributing to TabFlow, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:
- Open a GitHub Discussion
- Join our Discord
- Email: dev@tabflow.app

Thank you for contributing! 🚀