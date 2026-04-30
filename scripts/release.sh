#!/bin/bash
# Local release script — builds all platform binaries, creates a GitHub Release
# on the PUBLIC repo (whitebit-exchange/whitebit-cli), and updates the Homebrew tap.
#
# Usage: ROBOT_GITHUB_TOKEN=ghp_xxx bash scripts/release.sh
#
# ROBOT_GITHUB_TOKEN must have repo write access to:
#   - whitebit-exchange/whitebit-cli  (release assets)
#   - whitebit-exchange/homebrew-tap  (formula update)
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}warning:${NC} $1"; }
die()  { echo -e "${RED}error:${NC} $1" >&2; exit 1; }

[ -n "${ROBOT_GITHUB_TOKEN:-}" ] || die "ROBOT_GITHUB_TOKEN is not set. Usage: ROBOT_GITHUB_TOKEN=ghp_xxx bash scripts/release.sh"

command -v bun >/dev/null 2>&1 || die "bun is not installed"
command -v gh  >/dev/null 2>&1 || die "gh (GitHub CLI) not installed — brew install gh"

# Public repo where releases live and where formula URLs point
REPO="whitebit-exchange/whitebit-cli"
TAP_REPO="whitebit-exchange/homebrew-tap"
DIST="dist/release"

# Use ROBOT_GITHUB_TOKEN for all gh commands against the public org
export GH_TOKEN="$ROBOT_GITHUB_TOKEN"

# ---------------------------------------------------------------------------
# Determine next version
# ---------------------------------------------------------------------------
log "Determining next version..."
LATEST_TAG=$(gh release list --repo "$REPO" --limit 1 --json tagName --jq '.[0].tagName' 2>/dev/null || echo "")
if [ -n "$LATEST_TAG" ]; then
  VERSION="${LATEST_TAG#v}"
  MAJOR=$(echo "$VERSION" | cut -d. -f1)
  MINOR=$(echo "$VERSION" | cut -d. -f2)
  PATCH=$(echo "$VERSION" | cut -d. -f3)
  NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
else
  NEW_VERSION="1.0.0"
fi
TAG="v${NEW_VERSION}"
log "Releasing $TAG on $REPO"

# ---------------------------------------------------------------------------
# Build all targets (Bun cross-compiles from any platform)
# ---------------------------------------------------------------------------
mkdir -p "$DIST"
TARGETS=(
  "bun-darwin-arm64:whitebit-darwin-arm64"
  "bun-darwin-x64:whitebit-darwin-x64"
  "bun-linux-x64:whitebit-linux-x64"
  "bun-linux-arm64:whitebit-linux-arm64"
  "bun-windows-x64:whitebit-windows-x64.exe"
)

BUILT=()
for entry in "${TARGETS[@]}"; do
  TARGET="${entry%%:*}"
  NAME="${entry##*:}"
  log "Building $NAME..."
  if bun build --compile --minify --target="$TARGET" src/cli.ts --outfile "$DIST/$NAME"; then
    BUILT+=("$NAME")
  else
    warn "Skipping $NAME — build failed"
  fi
done

[ ${#BUILT[@]} -eq 0 ] && die "All builds failed"

# ---------------------------------------------------------------------------
# SHA256 checksums
# ---------------------------------------------------------------------------
log "Computing SHA256 checksums..."
cd "$DIST"
shasum -a 256 "${BUILT[@]}" > SHA256SUMS.txt
cat SHA256SUMS.txt
cd - >/dev/null

sha256_for() {
  grep " $1$" "$DIST/SHA256SUMS.txt" | awk '{print $1}' || true
}

DARWIN_ARM64_SHA=$(sha256_for "whitebit-darwin-arm64")
DARWIN_X64_SHA=$(sha256_for "whitebit-darwin-x64")
LINUX_X64_SHA=$(sha256_for "whitebit-linux-x64")
LINUX_ARM64_SHA=$(sha256_for "whitebit-linux-arm64")

# ---------------------------------------------------------------------------
# Create GitHub Release on the public repo
# ---------------------------------------------------------------------------
log "Creating GitHub Release $TAG on $REPO..."
RELEASE_FILES=()
for name in "${BUILT[@]}"; do
  RELEASE_FILES+=("$DIST/$name")
done
RELEASE_FILES+=("$DIST/SHA256SUMS.txt")

gh release create "$TAG" \
  "${RELEASE_FILES[@]}" \
  --repo "$REPO" \
  --title "WhiteBIT CLI $TAG" \
  --notes "$(cat <<EOF
## WhiteBIT CLI $TAG

### Install via Homebrew
\`\`\`bash
brew install whitebit-exchange/tap/whitebit
\`\`\`

### Manual install (macOS/Linux)
\`\`\`bash
curl -fsSL https://github.com/$REPO/releases/download/$TAG/whitebit-\$(uname -s | tr '[:upper:]' '[:lower:]')-\$(uname -m | sed 's/x86_64/x64/;s/aarch64/arm64/') -o whitebit
chmod +x whitebit && sudo mv whitebit /usr/local/bin/
\`\`\`

Verify with \`SHA256SUMS.txt\`.
EOF
)"

# ---------------------------------------------------------------------------
# Update homebrew-tap formula
# ---------------------------------------------------------------------------
log "Updating homebrew-tap formula..."
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

TAP_REMOTE="https://x-access-token:${ROBOT_GITHUB_TOKEN}@github.com/${TAP_REPO}.git"
git clone "$TAP_REMOTE" "$TMP"
mkdir -p "$TMP/Formula"

{
  echo "class Whitebit < Formula"
  echo "  desc \"WhiteBIT Exchange CLI\""
  echo "  homepage \"https://github.com/${REPO}\""
  echo "  version \"${NEW_VERSION}\""
  echo "  license \"Apache-2.0\""
  echo ""

  if [ -n "$DARWIN_ARM64_SHA" ] || [ -n "$DARWIN_X64_SHA" ]; then
    echo "  on_macos do"
    [ -n "$DARWIN_ARM64_SHA" ] && {
      echo "    on_arm do"
      echo "      url \"https://github.com/${REPO}/releases/download/${TAG}/whitebit-darwin-arm64\""
      echo "      sha256 \"${DARWIN_ARM64_SHA}\""
      echo "    end"
    }
    [ -n "$DARWIN_X64_SHA" ] && {
      echo "    on_intel do"
      echo "      url \"https://github.com/${REPO}/releases/download/${TAG}/whitebit-darwin-x64\""
      echo "      sha256 \"${DARWIN_X64_SHA}\""
      echo "    end"
    }
    echo "  end"
    echo ""
  fi

  if [ -n "$LINUX_ARM64_SHA" ] || [ -n "$LINUX_X64_SHA" ]; then
    echo "  on_linux do"
    [ -n "$LINUX_ARM64_SHA" ] && {
      echo "    on_arm do"
      echo "      url \"https://github.com/${REPO}/releases/download/${TAG}/whitebit-linux-arm64\""
      echo "      sha256 \"${LINUX_ARM64_SHA}\""
      echo "    end"
    }
    [ -n "$LINUX_X64_SHA" ] && {
      echo "    on_intel do"
      echo "      url \"https://github.com/${REPO}/releases/download/${TAG}/whitebit-linux-x64\""
      echo "      sha256 \"${LINUX_X64_SHA}\""
      echo "    end"
    }
    echo "  end"
    echo ""
  fi

  echo "  def install"
  echo "    bin.install Dir[\"whitebit-*\"].first => \"whitebit\""
  echo "  end"
  echo ""
  echo "  test do"
  echo "    assert_match version.to_s, shell_output(\"#{bin}/whitebit --version\")"
  echo "  end"
  echo "end"
} > "$TMP/Formula/whitebit.rb"

cat "$TMP/Formula/whitebit.rb"

git -C "$TMP" config user.name "whitebit-robot"
git -C "$TMP" config user.email "robot@whitebit.com"
git -C "$TMP" add Formula/whitebit.rb
git -C "$TMP" commit -m "whitebit ${NEW_VERSION}"
git -C "$TMP" remote set-url origin "$TAP_REMOTE"
git -C "$TMP" push

log "Done!"
echo ""
echo "  brew install whitebit-exchange/tap/whitebit"
echo ""
