# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the WhiteBIT CLI, **do not open a public GitHub issue**.

Please report it privately by emailing **support@whitebit.com.** with:
- A description of the vulnerability
- Steps to reproduce
- The potential impact

You will receive a response within 5 business days. We aim to release a fix within 30 days of confirmation.

## Scope

Issues in scope include:
- Credential leakage (API keys written to logs, process list, temp files)
- Insecure storage of the config file
- HMAC signing weaknesses
- Injection vulnerabilities in CLI argument parsing
- Command injection via API responses

## Security Best Practices for Users

**Protect your config file**

The CLI stores credentials in `~/.whitebit/config.toml` with `0600` permissions (readable only by your user). Verify this:

```bash
ls -la ~/.whitebit/config.toml
# Should show: -rw------- (0600)
```

**Never commit `.env` or config files**

Add to your `.gitignore`:
```
.env
.env.*
```

The CLI config lives at `~/.whitebit/config.toml` — outside any project directory — so it is never accidentally committed. Never copy credentials into a project-local file.

**Rotate keys regularly**

If you suspect a key has been exposed, revoke it immediately at whitebit.com/settings/api and generate a new one.

**Prefer `--dry-run` before executing write commands**

```bash
# Preview first
whitebit --dry-run trade spot limit-order BTC_USDT buy 0.001 50000

# Execute when sure
whitebit trade spot limit-order BTC_USDT buy 0.001 50000
```

## Known Limitations

- API secrets are stored in plain text in `~/.whitebit/config.toml`. Full-disk encryption is recommended on shared machines.
- The `--verbose` flag prints request headers to stderr; auth headers are masked, but ensure you do not share verbose output publicly.
