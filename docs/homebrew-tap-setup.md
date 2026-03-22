# Homebrew Tap Setup (Reference)

This document describes how the `whitebit-exchange/homebrew-tap` repository should be wired to auto-update `Formula/whitebit.rb` on every CLI release.

## Overview

The CLI release workflow in this repo (`.github/workflows/release.yml`) already emits a `repository_dispatch` event to the tap repo with:

- `version`
- `tag`
- `darwin_x64_sha256`
- `darwin_arm64_sha256`
- `linux_x64_sha256`
- `linux_arm64_sha256`
- `repository`

The tap repo should receive that payload, update the formula file, and push a commit.

## Tap Repo Workflow

Create `.github/workflows/update-formula.yml` in `whitebit-exchange/homebrew-tap`:

```yaml
name: Update Formula

on:
  repository_dispatch:
    types: [release]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update Formula values
        run: |
          VERSION='${{ github.event.client_payload.version }}'
          TAG='${{ github.event.client_payload.tag }}'
          DARWIN_X64='${{ github.event.client_payload.darwin_x64_sha256 }}'
          DARWIN_ARM64='${{ github.event.client_payload.darwin_arm64_sha256 }}'
          LINUX_X64='${{ github.event.client_payload.linux_x64_sha256 }}'
          LINUX_ARM64='${{ github.event.client_payload.linux_arm64_sha256 }}'

          sed -i "s/version \".*\"/version \"${VERSION}\"/" Formula/whitebit.rb
          sed -i "0,/sha256 \".*\"/s//sha256 \"${DARWIN_ARM64}\"/" Formula/whitebit.rb
          sed -i "0,/sha256 \".*\"/s//sha256 \"${DARWIN_X64}\"/" Formula/whitebit.rb
          sed -i "0,/sha256 \".*\"/s//sha256 \"${LINUX_ARM64}\"/" Formula/whitebit.rb
          sed -i "0,/sha256 \".*\"/s//sha256 \"${LINUX_X64}\"/" Formula/whitebit.rb

          # URLs already use v#{version}; keep them unchanged.

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add Formula/whitebit.rb
          git commit -m "chore(formula): update whitebit to v${{ github.event.client_payload.version }}"
          git push
```

## Secrets Needed in CLI Repo

The CLI repo release workflow expects:

- `HOMEBREW_TAP_TOKEN` (PAT with repo access to `whitebit-exchange/homebrew-tap`)
- `NPM_TOKEN`
- Tailscale secrets (if keeping current release workflow networking setup)

## Manual Validation

After a release in CLI repo:

1. Confirm `release.yml` completed successfully.
2. Confirm `repository_dispatch` was sent.
3. Confirm tap repo workflow ran and committed formula changes.
4. Run `brew update` then `brew install whitebit-exchange/tap/whitebit` on a clean machine.
