#!/bin/bash

# Development setup script for µLM AI Playground
# This script sets up the development environment

set -e

echo "🛠️ Setting up µLM AI Playground development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "💡 Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    echo "💡 Please upgrade Node.js to version 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# OpenAI API Key (required for AI block generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (optional, for Claude integration)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Environment
VITE_APP_ENV=development

# Optional: Google Analytics
# VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here
EOF
    echo "⚠️  Please add your API keys to .env.local file"
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📚 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Run initial type check
echo "🔍 Running initial type check..."
npm run type-check

echo "✅ Development environment setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Add your API keys to .env.local"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3002 in your browser"
echo ""
echo "📖 For more information, see README.md"
