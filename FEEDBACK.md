# Uniswap Developer Feedback — Hedgr

**Project:** Hedgr — non-custodial portfolio protection for tokenized stocks on Base
**Runtime track:** Uniswap — New Assets, New Agents
**Repo:** https://github.com/AvinashNayak27/hedgebase

## What we built with Uniswap

**Integration commit:** https://github.com/AvinashNayak27/hedgebase/commit/c34c7756840de7dcffbb74f6bcbb3dff2ec531e0

Hedgr uses the Uniswap Trading API as the acquisition and pricing layer for tokenized equities (NVDAc, TSLAc, AMZNc, METAc, AAPLc, GOOGLc) on Base:

- `POST /v1/quote` — indicative stock prices for the portfolio dashboard, plus executable buy/sell quotes in the trade flow (`app/api/uniswap/quote`, `app/api/uniswap/prices`)
- `POST /v1/check_approval` — token approval checks before swaps (`app/api/uniswap/approval`)
- `POST /v1/swap` — swap execution, including UniswapX orders with signed `permitData` (`app/api/uniswap/swap`, `app/stocks/[symbol]/trade`)

## What worked well

- **The developer docs paired with the agent skills were very helpful.** We installed the `swap-integration` skill and pointed our coding agent at it; it produced a working integration — quote → approval → permit signature → swap — on the first pass. Having the integration packaged as a skill meant the agent had the exact request shapes, headers (`x-universal-router-version`, `x-agent-info`), and permit-signing flow without us hand-holding it through the docs. This is the best developer-onboarding experience we've had for a trading API, and we'd love to see more API providers ship agent-consumable docs this way.
- The REST API surface is small and predictable: three endpoints covered pricing, approvals, and both classic and UniswapX execution.
- UniswapX routing falling out of the same quote endpoint was a nice surprise — no separate integration path needed.

## Suggestions

- **Document the quote response shapes by routing type.** Executable quotes return `quote.output.amount` for classic routes but `orderInfo.outputs[].startAmount` for UniswapX (DUTCH_V2/V3, PRIORITY). We had to inspect responses to learn this; a table in the docs would save integrators a debugging cycle.
- **Clarify which fields to strip before POSTing `/v1/swap`.** We discovered `permitData` / `permitTransaction` must be removed from the quote body (with `permitData` re-attached only for non-UniswapX signed orders). A canonical "swap request schema" in the docs would make this less trial-and-error.
- A lightweight **test/sandbox mode or known-good example payloads** per route would help teams verify integrations without burning gas on mainnet swaps.

Overall: excellent experience — the agent-skill-first docs are the standout, and the API itself was reliable throughout the build week.
