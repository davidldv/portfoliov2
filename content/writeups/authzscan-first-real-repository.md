---
title: "authzscan on Real Code: What a 100% Benchmark Score Failed to Predict"
description: "The live eval landed at 100% recall and precision. Then I pointed the scanner at a real open-source repo and it found one genuine bug in eleven candidates. The gap was in my benchmark, not the model."
date: 2026-08-25
tags: ["idor", "bola", "agents", "llm", "nextjs", "eval", "benchmarks", "appsec"]
category: "appsec"
difficulty: "hard"
draft: false
---

## TL;DR

The live eval I promised in the [last writeup](/writeups/authzscan-agentic-idor-scanner/) landed: 100% recall, 100% precision, 16 of 16 seeded bugs, zero of the 6 hardened twins flagged, $2.10 and about 19 minutes on `claude-sonnet-4-6`.

Then I ran it against [rallly](https://github.com/lukevella/rallly), a real open-source scheduling app. It produced 11 candidates. Hand review kept one genuine finding and one harmless missing consistency check.

Seven bugs turned up in the process, and not one of them was in the model. They were all in my tool, and every one was invisible to a benchmark of 24 files. Fixes are in [authzscan 0.1.1](https://www.npmjs.com/package/authzscan).

## Pricing a scan before paying for it

Phase 1 is deterministic, so endpoint count, trace-group count and the auth profile all cost nothing. Before spending a cent I ran inventory across eight repositories:

| Repo | Endpoints | Trace groups | Source files | Est. full scan |
|---|---|---|---|---|
| my benchmark | 23 | 21 | 24 | $2.10 measured |
| rallly | 23 | 10 | 650 | $1.20 to $2.20 |
| openstatus | 41 | 5 | 261 | $0.40 to $0.80 |
| papermark | 69 | 31 | 1521 | $6 to $12 |
| formbricks | 186 | 54 | 2707 | $15+ |
| inbox-zero | 247 | 112 | 2991 | $30+ |
| dub | 647 | 367 | 1521 | $37+ |

Cost tracks trace groups multiplied by repository size, not endpoint count. My benchmark has 24 files. Every real repository has between 250 and 3000, and that single number is behind most of what follows.

The estimate was also wrong. rallly came in at $3.01 against a predicted $1.20 to $2.20, because I extrapolated per-group cost from an app whose files are a tenth the size.

## Seven bugs the benchmark could not see

- **It refused to open the repository.** `runInventory` resolved `<repo>/app` and nothing else. Next.js supports `app/` and `src/app/` equally, and rallly uses the second, so the scanner rejected it as "not a Next.js App Router repo". My benchmark is flat, so this never came up.
- **A scan that analyzed nothing exited `0`.** My first live run had unresolvable credentials. All ten trace groups failed, 18 of 23 endpoints went unanalyzed, the report body correctly listed every one as NOT ANALYZED, and the process exited `0`. In CI that is a passing build. My own README says a scanner that turns "I could not analyze this" into a green check is worse than no scanner. The report honored that. The exit code, which is the part CI reads, did not.
- **No circuit breaker.** That same run retried all ten groups, three attempts each, failing identically every time. It now stops after three consecutive group failures, which also covers a dead network, a hard rate limit and a bad model id.
- **`--budget` is a stop signal, not a cap.** It is checked before each group, which is right, since halting mid-conversation burns the input tokens and throws the answer away. It also means the ceiling can overshoot by one group's cost. On rallly one group cost $0.81, and a $2.20 ceiling spent $3.01.
- **Coverage counted endpoints it never looked at.** The report claimed 5 of 23 analyzed on a run where nothing was analyzed. Those five were excluded in phase 1 for having no database access and no client-controlled input, which is a legitimate deterministic exclusion and the wrong word for it in a report that exists to separate examined from unexamined.
- **Resume adopted the output of a phase that gave up.** When the budget ran out during trace, the verify phase wrote its degraded findings to `findings.json` anyway, and `--resume` reads that file before deciding whether to verify. The failed pass cached itself as finished. Artifacts now record whether the phase completed.
- **Ownership idioms came only from the app directory.** This is the one that mattered. rallly keeps every authorization helper in `src/features` and `src/lib`, so phase 1 reported zero ownership idioms, and the trace agent went into every endpoint having been told the repository has no authorization conventions. Widening the scan to the source root took rallly from 0 to 31 idioms and papermark from 16 to 75, with the benchmark unchanged.

## What the scan actually returned

Eleven candidates, all labelled "confirmed", none of them verified.

The budget ran out during phase 2, so phase 3 never made a single call. Every candidate fell through the branch that marks unverified work `confirmed` with low confidence rather than dropping it, because a dropped candidate is a false clean and that is the worse failure. The report body said `UNVERIFIED` on all eleven. The summary line, the finding count and the exit code said confirmed.

So I verified all eleven by hand. One real finding, one missing consistency check with no meaningful exploit, and nine false positives.

The real finding is an unauthenticated disclosure of personal data. It is with the maintainer under a private advisory and I am not describing it until they have had a chance to fix it.

## Why the false positives happened

Five of the nine were the ownership-idiom bug wearing different hats: queries reported as missing a tenancy guard that carried `spaceId: AuthorizedSpaceId` right there in the Prisma `where` clause. That is a branded type, producible only by an authorization check, threaded through every mutation. It is a *stricter* convention than most codebases manage, and the scanner could not see it because it was reading the wrong directory.

The other four are more interesting, because the trace pass was factually correct about the code every time and still wrong about the conclusion.

One flagged an S3 read keyed on a client-supplied path with no session check. True. Every writer to that bucket is governed by an asset-profile allowlist, so the bucket holds avatars, space icons and branding logos: content that exists to be rendered anonymously in an `<img>` tag.

Two flagged license-validation endpoints for looking up a record by a client-supplied key with no ownership check. Also true. The license key *is* the bearer credential, and a self-hosted instance validating its licence has no session to present. Requiring one would be circular.

The pattern is the same in all of them. The agent established "this read has no ownership check" and concluded "anyone can read other people's data", skipping the step where you work out what the store contains and who is supposed to reach it. For the avatar bucket, that answer lives in every *writer* to the bucket, not in the handler being traced.

That step is exactly what phase 3 exists to do, and phase 3 is the part that never ran.

## What I learned

- **A benchmark measures the model. It does not measure the tool.** Mine answered "can the agent spot a planted bug", which turned out not to be the hard part. It could not answer "does this survive a repository somebody grew over four years", and those have different failure modes.
- **Four of the seven bugs ran on every single benchmark pass without ever failing.** The exit code was computed on all 21 groups each time. `list_files` was called constantly. Neither could break on 24 files. A green eval that exercises the broken line every run and still cannot see it is a specific, demonstrable failure of benchmark *shape*, not of coverage.
- **Precision is a property of context, not of prompting.** The single highest-leverage fix was one line in a deterministic AST pass deciding which directories to read. No prompt engineering touched it.
- **The honest-degradation design held, and it was not enough.** Reporting unanalyzed endpoints as unanalyzed worked exactly as intended. The summary line and the exit code, which are what people actually read, contradicted it. Machine-readable honesty and human-readable honesty are separate implementations of the same principle, and I only built one.
- **Run it on real code earlier than feels comfortable.** One $3.01 scan taught me more than the benchmark did at 100%.

## Roadmap

- Multi-run eval numbers with real error bars, on both the seeded benchmark and a fixed set of real repositories.
- A third coverage bucket in the report: analyzed, excluded deterministically, and not analyzed.
- Partial re-verification on resume, so an incomplete verify pass re-checks only the candidates it never reached.
- Function-level authorization as a second, separately gated bug class.

## References

- [The authzscan landing page](/authzscan)
- [authzscan on GitHub](https://github.com/davidldv/authzscan)
- [authzscan on npm](https://www.npmjs.com/package/authzscan)
- [Building authzscan, the previous writeup](/writeups/authzscan-agentic-idor-scanner/)
- [OWASP A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
