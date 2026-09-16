---
title: "Building jwt-scan: A CLI That Hunts the Five JWT Bugs From My Lab"
description: "Turning a vulnerability lab into a shippable scanner. From research artifact to npm package, with token-only and live-endpoint modes, in one weekend."
date: 2026-04-28
tags: ["jwt", "cli", "tooling", "appsec", "node", "typescript"]
category: "appsec"
difficulty: "medium"
---

## TL;DR

I took the five JWT bugs I'd reproduced from scratch in [jwt-lab](https://github.com/davidldv/jwt-lab) and turned the detection logic into a CLI. One command checks a static token, probes a live endpoint, or both.

```bash
npx jwt-scan --token "$TOKEN" --url "GET https://api.example.com/me"
```

Repo: [github.com/davidldv/jwt-scan](https://github.com/davidldv/jwt-scan) · [npm](https://www.npmjs.com/package/jwt-scan)

## Why build it

The lab proved I understood the bugs. A scanner had to prove that understanding survives contact with tokens I've never seen. Same five flaws, but now I had to:

- Detect each one without reading the source.
- Decide which checks work on a static token and which need a live endpoint.
- Produce output a CI pipeline can gate on.

The lab is about the attack. The CLI is about running the attack against a target you don't control.

## What it checks

| ID      | Issue                              | Mode             |
|---------|------------------------------------|------------------|
| JWT-001 | `alg=none` accepted (case variants)| token + http     |
| JWT-002 | HS256/RS256 key confusion          | http + pubkey    |
| JWT-003 | Weak HS256 secret (dictionary)     | token            |
| JWT-004 | `kid` header injection             | http             |
| JWT-005 | Missing/invalid `exp`/`iss`/`aud`  | token            |

Each row was an exploit script in the lab. Here it's a check function with a severity, a finding ID, and a pointer to the fix.

## Design choices

**Two modes, one binary.** Token-only mode runs the cryptographic and structural checks offline: weak-secret brute force, claim validation. HTTP mode replays mutated tokens against the target and reads the response. Some checks need both. `alg=none` is only a theory from a token alone; it's proven when the server accepts a forged copy.

**Case variants matter.** Filters for `alg=none` often check the literal string. `None`, `NONE`, `nOnE` walk straight past a naive denylist, so JWT-001 walks the casing.

**Key confusion needs the public key.** JWT-002 takes the RS256 public key, treats it as an HS256 secret, signs a forged token with it, and checks whether the server accepts it. Without the pubkey the check is skipped, and it says so: `skipped: needs --public-key`, not a silent pass.

**The weak-secret check is bounded.** JWT-003 runs a small wordlist (jwt-secrets top-N) plus common patterns. It's not a cracker. The question it answers is "is your secret embarrassingly short", the `secret` / `password` / `changeme` tier. Real cracking is hashcat's job.

**`kid` injection.** JWT-004 tries path traversal (`../../dev/null`), command-injection patterns, and SQLi-style payloads in the `kid` header, then compares the response against a baseline request to spot a difference.

**Claim hygiene.** JWT-005 is the boring one, and the one that fails most often. A token with no `exp` is accepted forever. A token with no `iss`/`aud` crosses service boundaries it was never meant to. Static check, no network.

## CI integration

```bash
npx jwt-scan --token "$T" --json
# exit code 1 if any high/critical findings
```

Drop it into a pipeline step. Token comes from a test login, and the scanner blocks the merge if a regression brings a finding back. The output is structured, so a SARIF converter is the obvious next step.

## What I learned

- Detection is harder than exploitation. Knowing the bug is there is one thing. Finding it with no source access, no false positives, and against a live target you don't want to knock over, that's the actual engineering.
- A skipped check is a finding. A scanner that quietly skips JWT-002 because nobody passed a public key is worse than one that says `skipped: configuration incomplete`. Show the gap.
- Severity is opinionated. `alg=none` accepted is critical. A missing `aud` is medium. The CLI ships defaults and lets you override per finding.
- Packaging is the long tail. The detection code took a weekend. The `npx`-able binary, the npm publish workflow, semver, and a README a recruiter can read in ten seconds took longer.

## Roadmap (v0.2+)

- `jku` and `x5u` URL trust checks: fetch keys from an attacker-controlled URL and forge.
- JWKS endpoint probing: list keys, find rotation gaps, spot weak ones.
- Blind-target heuristics: when the body says nothing, infer success from latency, status codes, or set-cookie deltas.
- SARIF output for GitHub Code Scanning.
- A Burp extension wrapper.

## References

- [jwt-scan on GitHub](https://github.com/davidldv/jwt-scan)
- [jwt-scan on npm](https://www.npmjs.com/package/jwt-scan)
- [jwt-lab, the vulnerability research it grew from](https://github.com/davidldv/jwt-lab)
- [JWT alg=none Bypass, prior writeup](/writeups/jwt-alg-none-bypass/)
- [PortSwigger: JWT attacks](https://portswigger.net/web-security/jwt)
