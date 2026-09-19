# Hedgr

**Keep your stocks. Hedge the risk.**

Hedgr is an onchain portfolio protection platform that helps users hedge their tokenized stock investments against market downturns. It connects to your wallet, analyzes your stock exposure and risk, and lets you choose how much of your portfolio you want to protect. Hedgr then creates an offsetting leveraged hedge through onchain markets (via Avantis on Base), helping reduce downside risk without requiring you to sell your underlying assets.

## How it works

1. **Connect your Base wallet** — Hedgr reads your tokenized stock balances directly from Base mainnet. Nothing is ever deposited into Hedgr.
2. **See your exposure** — the dashboard combines your stock holdings and any existing Avantis positions into one view: value, hedge coverage, net directional exposure, and margin health.
3. **Choose protection** — pick how much of a position to hedge (25%, 50%, 75%, 100%) and a conservative leverage level.
4. **Hedgr opens the offsetting short** — an opposing perpetual position is opened on Avantis, sized to match your stock exposure. You sign the transactions; Avantis executes.
5. **Monitor and adjust** — coverage is continuously recalculated as balances and prices move, with warnings when a hedge drifts, and tools to rebalance, add or remove collateral, or close protection.

Don't own the stock yet? An embedded Uniswap flow lets you swap USDC for tokenized stocks directly into your wallet, then protect them in the same session.

## Non-custodial by design

- Hedgr deploys **zero smart contracts** — no vaults, no pooled funds.
- Your stocks and USDC never leave your wallet.
- Every transaction is signed by you and executes directly against Avantis or Uniswap.

## Supported assets

Tokenized equities on Base, each mapped to an Avantis equity perp:

| Company  | Token  | Hedge market |
| -------- | ------ | ------------ |
| NVIDIA   | NVDAc  | NVDA/USD     |
| Tesla    | TSLAc  | TSLA/USD     |
| Amazon   | AMZNc  | AMZN/USD     |
| Meta     | METAc  | META/USD     |
| Apple    | AAPLc  | AAPL/USD     |
| Alphabet | GOOGLc | GOOG/USD     |

## Tech stack

- **Next.js + TypeScript** — app and API routes
- **wagmi / viem / RainbowKit** — wallet connection and onchain reads on Base
- **Avantis tx-builder API** — equity perpetual markets, positions, and hedge transactions
- **Uniswap Trading API** — quotes, approvals, and swaps for tokenized stocks
- **Farcaster candles API + Liveline** — price history and live charts

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable            | Used for                                        |
| ------------------- | ----------------------------------------------- |
| `UNISWAP_API_KEY`   | Stock prices, swap quotes, approvals, execution |
| `FARCASTER_API_KEY` | Historical candle data for stock charts         |

Set them in `.env.local` (ignored by git).

## Project layout

```
app/
  api/avantis/      pairs, positions, open/manage hedge routes
  api/uniswap/      prices, quote, approval, swap routes
  api/market/       candle history
  components/       portfolio engine, nav, sheets, shared UI
  lib/markets.ts    supported stock ↔ Avantis market mapping
  stocks/[symbol]/  detail, trade, and protect flows
  discover/ activity/ profile/
```

See `prd.md` for the full product requirements and `design.md` for the design system.
