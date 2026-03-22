#!/bin/bash
set -e

# WhiteBIT CLI - Local Multi-Platform Build Script
# Builds binaries for all supported platforms using Bun

echo "🚀 Building WhiteBIT CLI for all platforms..."
echo ""

# Define build targets
targets=("bun-linux-x64" "bun-linux-arm64" "bun-darwin-x64" "bun-darwin-arm64" "bun-windows-x64")

# Create dist directory
mkdir -p dist

# Get version from package.json or use "local"
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "local")

echo "📦 Version: $VERSION"
echo ""

# Build for each target
for target in "${targets[@]}"; do
  # Determine output filename
  platform="${target#bun-}"
  output="dist/whitebit-${platform}"
  
  # Add .exe extension for Windows
  if [[ "$target" == *"windows"* ]]; then
    output="${output}.exe"
  fi
  
  echo "🔨 Building for $platform ($target)..."
  
  # Build with Bun
  bun build --compile --minify --target="$target" \
    --define "VERSION=\"$VERSION\"" \
    src/cli.ts --outfile "$output"
  
  echo "✅ Built: $output"
  echo ""
done

echo "📊 Build Summary:"
echo "================="
ls -lh dist/

echo ""
echo "🔐 Generating SHA256 checksums..."
cd dist
sha256sum whitebit-* > SHA256SUMS.txt
cat SHA256SUMS.txt

echo ""
echo "✨ All builds complete!"
echo ""
echo "To test a binary:"
echo "  ./dist/whitebit-linux-x64 --version"
echo "  ./dist/whitebit-darwin-arm64 --version"
