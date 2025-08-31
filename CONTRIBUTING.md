# Contributing to µLM AI Playground

We love your input! We want to make contributing to µLM AI Playground as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issues](https://github.com/your-username/mulm-ai-playground/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/your-username/mulm-ai-playground/issues/new).

### Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/mulm-ai-playground.git
cd mulm-ai-playground

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your API keys to .env.local

# Start development server
npm run dev
```

### Code Style

We use ESLint and Prettier for code formatting. Before submitting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check TypeScript
npm run type-check
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── workspace/      # Workspace-specific components
│   ├── assistant/      # AI assistant components
│   ├── editor/         # Code editor components
│   └── export/         # Export and deployment
├── pages/              # Main application pages
├── services/           # Business logic and AI integrations
├── storage/            # Data management and persistence
├── simulation/         # Real-time workflow simulation
├── types/              # TypeScript type definitions
└── data/               # Static data and examples
```

## Adding New AI Blocks

To add a new AI block:

1. **Define the block** in `src/data/AIBlockExamples.ts`:

```typescript
export const newAIBlock: BlockDefinition = {
  id: 'new-ai-block',
  name: 'New AI Block',
  category: 'processing',
  description: 'Description of what this block does',
  version: '1.0.0',
  inputs: [
    { id: 'input1', name: 'Input 1', type: 'text', required: true }
  ],
  outputs: [
    { id: 'output1', name: 'Output 1', type: 'text', required: true }
  ],
  implementation: `
# Python implementation
def process(input1):
    # Your AI logic here
    return {"output1": result}
  `
};
```

2. **Add to block palette** in `src/components/BlockPalette.tsx`
3. **Test the implementation** in the workspace
4. **Add documentation** explaining the block's purpose and usage

## Adding New Export Formats

To add a new export format:

1. **Extend the export service** in `src/export/UniversalExportService.ts`
2. **Add the new format** to the export modal
3. **Test the generated code** works correctly
4. **Add documentation** for the new format

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Guidelines

### Code Guidelines

- Use TypeScript for all new code
- Follow existing code patterns and naming conventions
- Write clear, descriptive commit messages
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### UI Guidelines

- Follow the existing design system
- Use Tailwind CSS for styling
- Ensure mobile responsiveness
- Test in both light and dark themes
- Use consistent spacing and typography

### Performance Guidelines

- Optimize for fast initial load
- Use React.memo for expensive components
- Implement proper loading states
- Avoid unnecessary re-renders

## Release Process

1. All changes happen through pull requests
2. Maintainers review and merge PRs
3. Releases are tagged and published automatically
4. Breaking changes require major version bump

## Questions?

Feel free to [open an issue](https://github.com/your-username/mulm-ai-playground/issues/new) or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
