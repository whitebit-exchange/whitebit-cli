import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

const ROOT_COMMANDS = [
  'help',
  'completion',
  'login',
  'market',
  'balance',
  'deposit',
  'withdraw',
  'transfer',
  'codes',
  'earn',
  'credit-lines',
  'ws-token',
  'config',
  'trade',
  'sub-account',
];

const MARKET_COMMANDS = [
  'list',
  'market-status',
  'asset-status',
  'futures-markets',
  'collateral-markets',
  'tickers',
  'depth',
  'trades',
  'kline',
  'fee',
  'funding-history',
  'activity',
  'server-time',
  'status',
  'mining-pool',
  'mining-hashrate',
];

const BALANCE_COMMANDS = ['main', 'trade', 'fee'];

const DEPOSIT_COMMANDS = ['address', 'fiat-address', 'create-address', 'refund'];

const WITHDRAW_COMMANDS = ['crypto', 'crypto-amount', 'fiat', 'history'];

const TRANSFER_COMMANDS = ['internal'];

const CODES_COMMANDS = ['create', 'apply', 'history', 'list'];

const EARN_FIXED_COMMANDS = ['plans', 'invest', 'investments-history', 'close-investment'];

const EARN_FLEX_COMMANDS = [
  'plans',
  'invest',
  'investments',
  'investment-history',
  'payment-history',
  'withdraw',
  'close',
  'auto-reinvest',
];

const EARN_GROUPS = ['fixed', 'flex', 'interest-history'];

const SUB_ACCOUNT_COMMANDS = [
  'list',
  'create',
  'edit',
  'delete',
  'block',
  'unblock',
  'balance',
  'transfer',
  'transfer-history',
  'api-key-list',
  'api-key-create',
  'api-key-edit',
  'api-key-reset',
  'api-key-delete',
  'ip-list',
  'ip-add',
  'ip-delete',
];

const TRADE_SPOT_COMMANDS = [
  'limit-order',
  'market-order',
  'bulk-order',
  'stop-limit',
  'stop-market',
  'buy-stock',
  'cancel',
  'cancel-all',
  'modify',
  'executed',
  'unexecuted',
  'deals',
  'history',
  'balance',
  'fee',
  'all-fees',
  'kill-switch-status',
  'kill-switch-sync',
];

const TRADE_COLLATERAL_COMMANDS = [
  'balance',
  'summary',
  'balance-summary',
  'hedge-mode',
  'set-hedge-mode',
  'limit-order',
  'market-order',
  'bulk-order',
  'stop-limit',
  'trigger-market',
  'set-leverage',
  'close-position',
  'open-positions',
  'position-history',
  'funding-history',
  'conditional-orders',
  'cancel-conditional',
  'oco-orders',
  'create-oco',
  'create-oto',
  'cancel-oco',
  'cancel-oto',
];

const TRADE_CONVERT_COMMANDS = ['estimate', 'confirm', 'history'];

const CONFIG_COMMANDS = ['show', 'set'];
const TRADE_GROUPS = ['spot', 'collateral', 'convert'];

const toWords = (values: string[]): string => values.join(' ');

const renderBashCompletion = (): string => `# bash completion for whitebit
_whitebit_completions() {
  local cur prev
  cur="${'$'}{COMP_WORDS[COMP_CWORD]}"
  prev="${'$'}{COMP_WORDS[COMP_CWORD-1]}"

  if [[ ${'$'}COMP_CWORD -eq 1 ]]; then
    COMPREPLY=( ${'$'}(compgen -W "${toWords(ROOT_COMMANDS)}" -- "${'$'}cur") )
    return 0
  fi

  case "${'$'}{COMP_WORDS[1]}" in
    market)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(MARKET_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    balance)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(BALANCE_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    deposit)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(DEPOSIT_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    withdraw)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(WITHDRAW_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    transfer)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(TRANSFER_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    codes)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(CODES_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    config)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(CONFIG_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    sub-account)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(SUB_ACCOUNT_COMMANDS)}" -- "${'$'}cur") )
      fi
      ;;
    earn)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(EARN_GROUPS)}" -- "${'$'}cur") )
      elif [[ ${'$'}COMP_CWORD -eq 3 ]]; then
        case "${'$'}{COMP_WORDS[2]}" in
          fixed)
            COMPREPLY=( ${'$'}(compgen -W "${toWords(EARN_FIXED_COMMANDS)}" -- "${'$'}cur") )
            ;;
          flex)
            COMPREPLY=( ${'$'}(compgen -W "${toWords(EARN_FLEX_COMMANDS)}" -- "${'$'}cur") )
            ;;
        esac
      fi
      ;;
    trade)
      if [[ ${'$'}COMP_CWORD -eq 2 ]]; then
        COMPREPLY=( ${'$'}(compgen -W "${toWords(TRADE_GROUPS)}" -- "${'$'}cur") )
      elif [[ ${'$'}COMP_CWORD -eq 3 ]]; then
        case "${'$'}{COMP_WORDS[2]}" in
          spot)
            COMPREPLY=( ${'$'}(compgen -W "${toWords(TRADE_SPOT_COMMANDS)}" -- "${'$'}cur") )
            ;;
          collateral)
            COMPREPLY=( ${'$'}(compgen -W "${toWords(TRADE_COLLATERAL_COMMANDS)}" -- "${'$'}cur") )
            ;;
          convert)
            COMPREPLY=( ${'$'}(compgen -W "${toWords(TRADE_CONVERT_COMMANDS)}" -- "${'$'}cur") )
            ;;
        esac
      fi
      ;;
  esac
}

complete -F _whitebit_completions whitebit
`;

const renderZshCompletion = (): string => `#compdef whitebit

_whitebit() {
  local -a root_commands
  root_commands=(${toWords(ROOT_COMMANDS)})

  if (( CURRENT == 2 )); then
    _describe 'command' root_commands
    return
  fi

  case ${'$'}words[2] in
    market)
      _describe 'market command' (${toWords(MARKET_COMMANDS)})
      ;;
    balance)
      _describe 'balance command' (${toWords(BALANCE_COMMANDS)})
      ;;
    deposit)
      _describe 'deposit command' (${toWords(DEPOSIT_COMMANDS)})
      ;;
    withdraw)
      _describe 'withdraw command' (${toWords(WITHDRAW_COMMANDS)})
      ;;
    transfer)
      _describe 'transfer command' (${toWords(TRANSFER_COMMANDS)})
      ;;
    codes)
      _describe 'codes command' (${toWords(CODES_COMMANDS)})
      ;;
    config)
      _describe 'config command' (${toWords(CONFIG_COMMANDS)})
      ;;
    sub-account)
      _describe 'sub-account command' (${toWords(SUB_ACCOUNT_COMMANDS)})
      ;;
    earn)
      if (( CURRENT == 3 )); then
        _describe 'earn group' (${toWords(EARN_GROUPS)})
      elif (( CURRENT == 4 )); then
        case ${'$'}words[3] in
          fixed) _describe 'fixed command' (${toWords(EARN_FIXED_COMMANDS)}) ;;
          flex) _describe 'flex command' (${toWords(EARN_FLEX_COMMANDS)}) ;;
        esac
      fi
      ;;
    trade)
      if (( CURRENT == 3 )); then
        _describe 'trade group' (${toWords(TRADE_GROUPS)})
      elif (( CURRENT == 4 )); then
        case ${'$'}words[3] in
          spot) _describe 'spot command' (${toWords(TRADE_SPOT_COMMANDS)}) ;;
          collateral) _describe 'collateral command' (${toWords(TRADE_COLLATERAL_COMMANDS)}) ;;
          convert) _describe 'convert command' (${toWords(TRADE_CONVERT_COMMANDS)}) ;;
        esac
      fi
      ;;
  esac
}

compdef _whitebit whitebit
`;

const renderFishCompletion = (): string => {
  const lines: string[] = ['# fish completion for whitebit', 'complete -c whitebit -f'];

  for (const root of ROOT_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_use_subcommand' -a '${root}'`);
  }

  for (const command of MARKET_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from market' -a '${command}'`);
  }

  for (const command of BALANCE_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from balance' -a '${command}'`);
  }

  for (const command of DEPOSIT_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from deposit' -a '${command}'`);
  }

  for (const command of WITHDRAW_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from withdraw' -a '${command}'`);
  }

  for (const command of TRANSFER_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from transfer' -a '${command}'`);
  }

  for (const command of CODES_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from codes' -a '${command}'`);
  }

  for (const command of CONFIG_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from config' -a '${command}'`);
  }

  for (const command of SUB_ACCOUNT_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from sub-account' -a '${command}'`);
  }

  for (const group of EARN_GROUPS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from earn' -a '${group}'`);
  }

  for (const command of EARN_FIXED_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from earn fixed' -a '${command}'`);
  }

  for (const command of EARN_FLEX_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from earn flex' -a '${command}'`);
  }

  for (const group of TRADE_GROUPS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from trade' -a '${group}'`);
  }

  for (const command of TRADE_SPOT_COMMANDS) {
    lines.push(`complete -c whitebit -n '__fish_seen_subcommand_from trade spot' -a '${command}'`);
  }

  for (const command of TRADE_COLLATERAL_COMMANDS) {
    lines.push(
      `complete -c whitebit -n '__fish_seen_subcommand_from trade collateral' -a '${command}'`,
    );
  }

  for (const command of TRADE_CONVERT_COMMANDS) {
    lines.push(
      `complete -c whitebit -n '__fish_seen_subcommand_from trade convert' -a '${command}'`,
    );
  }

  return `${lines.join('\n')}\n`;
};

const shellScriptByName = {
  bash: renderBashCompletion,
  zsh: renderZshCompletion,
  fish: renderFishCompletion,
} as const;

export const completionCommand = defineCommand({
  name: 'completion',
  description: 'Generate shell completion script (bash, zsh, fish)',
  options: {
    shell: option(z.enum(['bash', 'zsh', 'fish']).default('bash'), {
      description: 'Target shell',
    }),
  },
  handler: async ({ flags }) => {
    const targetShell = flags.shell ?? 'bash';
    const render = shellScriptByName[targetShell];
    process.stdout.write(render());
  },
});
