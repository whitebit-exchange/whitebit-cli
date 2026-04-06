#!/usr/bin/env bash
set -euo pipefail

# WhiteBIT CLI — Local Multi-Platform Build Script
#
# Builds each target on a matching native environment to avoid
# cross-compilation issues with platform-specific native packages.
#
#   macOS (darwin-arm64 / darwin-x64) — built natively on the host
#   Linux (linux-x64 / linux-arm64)   — built inside Docker containers
#   Windows                            — skipped (no local equivalent)
#
# Prerequisites: Docker running, Bun installed

mkdir -p dist

BUN_IMAGE="oven/bun:latest"
ARCH="$(uname -m)"   # arm64 or x86_64

# ── macOS native builds ──────────────────────────────────────────────────────

build_native() {
  local target="$1" platform="$2"
  local out="dist/whitebit-${platform}"
  echo "→ $platform (native)"
  bun build --compile --minify --target="$target" src/cli.ts --outfile "$out"
  echo "  built: $out"
}

case "$ARCH" in
  arm64)
    build_native bun-darwin-arm64 darwin-arm64
    echo "  (skipping darwin-x64 — requires Intel Mac)"
    ;;
  x86_64)
    build_native bun-darwin-x64 darwin-x64
    echo "  (skipping darwin-arm64 — requires Apple Silicon Mac)"
    ;;
esac

# ── Linux builds via Docker ──────────────────────────────────────────────────

build_linux() {
  local docker_platform="$1" bun_target="$2" platform="$3"
  local out="dist/whitebit-${platform}"
  echo "→ $platform (Docker $docker_platform)"
  docker run --rm \
    --platform "$docker_platform" \
    -v "$(pwd):/workspace" \
    "$BUN_IMAGE" \
    sh -c "cp -r /workspace /build && cd /build && bun install --frozen-lockfile && bun build --compile --minify --target=$bun_target src/cli.ts --outfile /tmp/whitebit-${platform} && cp /tmp/whitebit-${platform} /workspace/$out"
  echo "  built: $out"
}

build_linux linux/amd64 bun-linux-x64   linux-x64
build_linux linux/arm64 bun-linux-arm64 linux-arm64

# ── Windows build ────────────────────────────────────────────────────────────

build_windows() {
  local out="dist/whitebit-windows-x64.exe"
  echo "→ windows-x64 (native)"
  bun build --compile --minify --target=bun-windows-x64 src/cli.ts --outfile "$out"
  echo "  built: $out"
}

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    build_windows
    ;;
  *)
    # Cross-compilation is not feasible — bun silently skips win32 optional
    # packages on non-Windows hosts so @opentui/core-win32-x64 never installs.
    # Run this script on Windows (Git Bash) to build the .exe natively.
    echo "→ windows-x64 (skipped — run on Windows to build natively)"
    ;;
esac

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "dist/"
ls -lh dist/
