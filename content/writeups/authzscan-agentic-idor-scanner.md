---
title: "Building authzscan: Agent-Driven IDOR Detection You Can Actually Measure"
description: "Why pattern-matching SAST misses broken access control, how a four-phase Claude agent pipeline finds it, and the seeded benchmark that keeps the whole thing honest."
date: 2026-07-07
tags: ["idor", "bola", "agents", "llm", "nextjs", "sast", "eval", "appsec"]
category: "appsec"
difficulty: "hard"
---

## TL;DR

Most access-control bugs aren't "no login." They're a logged-in user reaching *other people's* data: `orders/[id]` fetched with the client-supplied `id` and no `WHERE userId = session.user`. That's [OWASP A01](https://owasp.org/Top10/A01_2021-Broken_Access_Control/), the top web risk, and Semgrep-style tools mostly can't see it, because working out *whose* data a query returns means reading the code, not matching its syntax.

authzscan is an automated IDOR/BOLA review for Next.js App Router repos: a deterministic inventory pass, a Claude agent that traces identifiers to queries, an adversarial verify pass, and SARIF output for GitHub code scanning. It also ships a seeded benchmark, so the accuracy claim is a number instead of a feeling.

Repo: [github.com/davidldv/authzscan](https://github.com/davidldv/authzscan)

## Why SAST misses this bug class

A rule engine can flag `eval(userInput)` because the bug is in the syntax. Now look at these two lines:

```ts
const order = await db.order.findUnique({ where: { id: params.id } });
const order = await db.order.findUnique({ where: { id: params.id, userId: session.user.id } });
```

The first is an IDOR if `params.id` is client-controlled and nothing checked ownership upstream. The second is fine. Same shape, same API, same taint path. The difference is a question about scope, and the answer might be three files away in a middleware or a helper. That's a reasoning problem, so I pointed a reasoning engine at it.

## The pipeline

Four phases. Only two call the model.

1. **Inventory (deterministic, ts-morph).** List every route handler and Server Action, read the auth library out of `package.json` (next-auth, Clerk, Lucia, or custom), and pull out the repo's own ownership idioms, every `where` clause that mentions a `userId` / `tenantId` / `organizationId`-style key. No LLM, byte-stable output.
2. **Trace (agent).** Per endpoint group, the agent gets read/grep/list tools and the auth profile from phase 1, follows each client-controlled identifier (route param, body field, query param) to the query it reaches, and emits a candidate wherever that query has no ownership scope. Its evidence has to cite file paths and line numbers it actually read.
3. **Verify (agent, adversarial).** A second pass with one job: kill false positives. Re-read the cited code, look for middleware that already scopes the request or a check earlier in the call chain, and confirm a finding *only* with a concrete "user A's session reaches user B's resource" scenario.
4. **Render (deterministic).** Markdown, SARIF 2.1.0, or JSON, plus CI exit codes (`0` clean, `1` confirmed findings, `2` scan error).

Feeding the repo's *own* idioms into the trace prompt mattered more than I expected. "Is this query scoped?" has no answer in the abstract. It has an answer against *how this codebase does scoping*.

## Degrade loudly, never silently

The worst failure for a security tool is a silent gap that reads as a clean bill of health. Two rules keep that from happening:

- An endpoint the scanner can't analyze is reported as **not analyzed**. It never folds into an implied "clean."
- A candidate the verify pass can't confirm surfaces as low-confidence `UNVERIFIED` instead of being dropped.

Same idea as jwt-scan's `skipped: needs --public-key`: make the gap visible, because no findings is not the same as no bugs.

## The eval harness is the actual project

An AI scanner without a benchmark is a demo. The eval is what makes it a tool:

- **16 seeded vulnerabilities** in a realistic Next.js app, ten bug shapes across a difficulty ladder: from "no auth at all" (easy) up to method asymmetry (GET scoped, the sibling DELETE not), wrong-subject checks (ownership verified against the *recipient* instead of the caller), check-after-write ordering bugs, indirect references through relations, and raw SQL filtered by a client-supplied `accountId`.
- **6 hardened twins**, the correctly-scoped versions of the same patterns, as false-positive traps. Recall without precision is just a noise machine.
- **Zero label leakage.** No `// VULN` markers to grep for, and the live eval scans a temp copy with the answer key removed.
- **A `PerfectRunner` oracle** that answers from the manifest and has to score 1.0/1.0. That proves the classifier and the metrics are right *regardless of model quality*. If your harness can't recognize a perfect run, its numbers mean nothing.
- **Gates:** at least 80% recall, at least 70% precision, reported as mean ± stddev across runs.

Honest status: the committed report is the oracle sanity run, and it passes. Live multi-run numbers against a real model cost real API spend and are the next milestone. The reason I built the gates first is that when those numbers land, they'll be checkable instead of curated.

## What I learned

- Verifying is a different skill than detecting. The trace pass wants to find things, and left alone it over-reports. Giving a second pass the explicit job of *rejecting* the first pass's work is what buys precision, the same reason code review beats reading your own code.
- Framing is load-bearing when you build on a model. "Find exploitable IDORs" and "do a defensive code review of the authorization logic" ask for the same work, but safety routing treats them differently. The defensive framing is also the accurate one, since the output is a fix list, not an exploit.
- Determinism is a budget feature. Anything that can be AST analysis (inventory, grouping, rendering) is, so tokens go only where reasoning is actually needed. A budget guard halts the scan at a spend ceiling, and every phase checkpoints to `.authzscan/`, so an interrupted scan resumes instead of re-billing.
- Narrow scope beats coverage theater. Object-level authorization only: no XSS, no SQLi, no authn, no Pages Router. One bug class done measurably beats ten done plausibly.

## Roadmap

- The live eval report (multi-run, mean ± stddev) committed to the repo.
- Function-level authorization (missing role checks) as a second, separately gated bug class.
- A GitHub Action wrapper, SARIF straight into code scanning on PRs.

## References

- [authzscan on GitHub](https://github.com/davidldv/authzscan)
- [OWASP A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [SARIF support for code scanning (GitHub docs)](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
- [Building jwt-scan, prior writeup](/writeups/jwt-scan-cli/)
- [The live eval and the first real repository, follow-up writeup](/writeups/authzscan-first-real-repository/)
- [The authzscan landing page](/authzscan)
