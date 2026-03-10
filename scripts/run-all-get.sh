#!/bin/bash
set -euo pipefail

# WhiteBIT CLI - Run All Read-Only (GET) Commands
# Excludes: market commands, deposit commands, withdrawal commands
# Excludes: any mutating commands (create, cancel, transfer, invest, close, modify, etc.)
#
# Usage:
#   ./scripts/run-all-get.sh                    # Run with default settings
#   ./scripts/run-all-get.sh --json             # Output as JSON
#   ./scripts/run-all-get.sh --dry-run          # Preview requests without executing
#   ./scripts/run-all-get.sh --profile testnet  # Use a specific profile

WHITEBIT="bun src/cli.ts"
EXTRA_FLAGS="${*:-}"
PASSED=0
FAILED=0
SKIPPED=0
ERRORS=()

run_cmd() {
  local label="$1"
  shift
  local cmd="$*"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶ ${label}"
  echo "  ${cmd}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if eval "${cmd}"; then
    echo "✅ PASS: ${label}"
    PASSED=$((PASSED + 1))
  else
    echo "❌ FAIL: ${label}"
    FAILED=$((FAILED + 1))
    ERRORS+=("${label}")
  fi
  echo ""
}

echo ""
echo "🔍 WhiteBIT CLI — Running all read-only (GET) commands"
echo "   Extra flags: ${EXTRA_FLAGS:-<none>}"
echo ""

# ═══════════════════════════════════════════════════════════
# Market — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "market server-time" \
  "${WHITEBIT} market server-time ${EXTRA_FLAGS}"

run_cmd "market status" \
  "${WHITEBIT} market status ${EXTRA_FLAGS}"

run_cmd "mining-pool overview" \
  "${WHITEBIT} mining-pool overview ${EXTRA_FLAGS}"

run_cmd "mining-pool hashrate" \
  "${WHITEBIT} mining-pool hashrate ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Balance — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "balance main" \
  "${WHITEBIT} balance main ${EXTRA_FLAGS}"

run_cmd "balance trade" \
  "${WHITEBIT} balance trade ${EXTRA_FLAGS}"

run_cmd "balance fee" \
  "${WHITEBIT} balance fee ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Codes — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "codes codes-history" \
  "${WHITEBIT} codes codes-history ${EXTRA_FLAGS}"

run_cmd "codes my-codes" \
  "${WHITEBIT} codes my-codes ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Earn Fixed — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "earn fixed plans" \
  "${WHITEBIT} earn fixed plans ${EXTRA_FLAGS}"

run_cmd "earn fixed investments-history" \
  "${WHITEBIT} earn fixed investments-history ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Earn Flex — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "earn flex plans" \
  "${WHITEBIT} earn flex plans ${EXTRA_FLAGS}"

run_cmd "earn flex investments" \
  "${WHITEBIT} earn flex investments ${EXTRA_FLAGS}"

run_cmd "earn flex investment-history" \
  "${WHITEBIT} earn flex investment-history ${EXTRA_FLAGS}"

run_cmd "earn flex payment-history" \
  "${WHITEBIT} earn flex payment-history ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Earn Interest — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "earn interest-history" \
  "${WHITEBIT} earn interest-history ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Account Data — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "credit-lines" \
  "${WHITEBIT} credit-lines ${EXTRA_FLAGS}"

run_cmd "ws-token" \
  "${WHITEBIT} ws-token ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Trade Spot — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "trade spot executed" \
  "${WHITEBIT} trade spot executed ${EXTRA_FLAGS}"

run_cmd "trade spot unexecuted" \
  "${WHITEBIT} trade spot unexecuted ${EXTRA_FLAGS}"

run_cmd "trade spot history" \
  "${WHITEBIT} trade spot history ${EXTRA_FLAGS}"

run_cmd "trade spot balance" \
  "${WHITEBIT} trade spot balance ${EXTRA_FLAGS}"

run_cmd "trade spot all-fees" \
  "${WHITEBIT} trade spot all-fees ${EXTRA_FLAGS}"

run_cmd "trade spot kill-switch-status" \
  "${WHITEBIT} trade spot kill-switch-status ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Trade Collateral — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "trade collateral balance" \
  "${WHITEBIT} trade collateral balance ${EXTRA_FLAGS}"

run_cmd "trade collateral summary" \
  "${WHITEBIT} trade collateral summary ${EXTRA_FLAGS}"

run_cmd "trade collateral balance-summary" \
  "${WHITEBIT} trade collateral balance-summary ${EXTRA_FLAGS}"

run_cmd "trade collateral hedge-mode" \
  "${WHITEBIT} trade collateral hedge-mode ${EXTRA_FLAGS}"

run_cmd "trade collateral open-positions" \
  "${WHITEBIT} trade collateral open-positions ${EXTRA_FLAGS}"

run_cmd "trade collateral position-history" \
  "${WHITEBIT} trade collateral position-history ${EXTRA_FLAGS}"

run_cmd "trade collateral funding-history" \
  "${WHITEBIT} trade collateral funding-history ${EXTRA_FLAGS}"

run_cmd "trade collateral conditional-orders" \
  "${WHITEBIT} trade collateral conditional-orders ${EXTRA_FLAGS}"

run_cmd "trade collateral oco-orders" \
  "${WHITEBIT} trade collateral oco-orders ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Trade Convert — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "trade convert history" \
  "${WHITEBIT} trade convert history ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Sub-Account — Read-only queries
# ═══════════════════════════════════════════════════════════

run_cmd "sub-account list" \
  "${WHITEBIT} sub-account list ${EXTRA_FLAGS}"

run_cmd "sub-account transfer-history" \
  "${WHITEBIT} sub-account transfer-history ${EXTRA_FLAGS}"

# ═══════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════

TOTAL=$((PASSED + FAILED + SKIPPED))

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                     SUMMARY                          ║"
echo "╠═══════════════════════════════════════════════════════╣"
printf "║  Total:  %-4s                                        ║\n" "${TOTAL}"
printf "║  ✅ Passed: %-4s                                     ║\n" "${PASSED}"
printf "║  ❌ Failed: %-4s                                     ║\n" "${FAILED}"
echo "╚═══════════════════════════════════════════════════════╝"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Failed commands:"
  for err in "${ERRORS[@]}"; do
    echo "  - ${err}"
  done
fi

exit "${FAILED}"
