#!/bin/bash

# Build script for µLM AI Playground
# This script builds the project for production deployment

set -e

echo "🚀 Building µLM AI Playground for production..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check

# Linting
echo "🧹 Running ESLint..."
npm run lint

# Build for production
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output is in the 'dist' directory"
    
    # Show build size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo "📊 Build size: $BUILD_SIZE"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Ready for deployment!"
