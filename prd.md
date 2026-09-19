# Hedgr

## Product Requirements Document

**Version:** MVP / YC Demo Day Prototype
**Network:** Base Mainnet
**Core integrations:** Avantis SDK, Base/EVM RPC, Uniswap swap widgets
**Initial assets:** TSLAc, NVDAc, AMZNc, GOOGLc, METAc

---

# 1. Product vision

Hedgr is a non-custodial hedging interface for tokenized equities on Base.

Users keep their tokenized stocks in their own wallet. Hedgr detects those positions, calculates their equity exposure, and allows the user to hedge that exposure by opening an opposing perpetual position through Avantis.

Users who do not already own a supported tokenized stock can acquire one directly through an embedded Uniswap swap experience.

Hedgr does not custody stocks, pool user funds, or deploy custom smart contracts.

The product acts as an interface and risk-management layer connecting:

**Tokenized stocks on Base + Avantis perpetuals + Uniswap liquidity**

The core product promise is:

**Keep your stocks. Hedge the risk.**

---

# 2. Problem

Tokenized equities make stocks composable and transferable onchain, but managing their price risk remains difficult.

A user holding $10,000 of tokenized NVIDIA who wants temporary downside protection currently needs to:

1. Determine their stock exposure.
2. Find a corresponding derivatives market.
3. Calculate the correct short size.
4. Determine how much margin is required.
5. Open and manage the perpetual position.
6. Monitor liquidation risk.
7. Monitor whether the stock position and hedge remain aligned.
8. Close or resize the hedge when their holdings change.

Hedgr turns this process into a simple workflow.

The user thinks:

> "I want to hedge 100% of my NVIDIA."

Hedgr handles the calculations and presents the required Avantis transaction.

---

# 3. Product principles

### Non-custodial

Tokenized stocks remain in the user's wallet.

Hedgr never requires users to deposit TSLAc, NVDAc, AMZNc, GOOGLc, or METAc into Hedgr.

### No custom protocol contracts

The MVP deploys no Hedgr smart contracts.

Transactions interact directly with existing protocols through their supported interfaces.

### Read from Base

Wallet balances and token positions are derived directly from Base Mainnet.

### Execute through Avantis

Perpetual positions are opened and managed using the Avantis SDK/API infrastructure.

### Buy through Uniswap

Users without the desired tokenized stock can acquire it through an embedded Uniswap swap widget or supported integration.

### Hedge, not speculate

The UX is designed around protecting an existing stock position rather than encouraging leveraged directional trading.

---

# 4. Initial supported assets

The MVP supports six technology stocks:

| Company  | Tokenized stock | Hedge market | Contract Address of Tokenised Stock on Base |
| -------- | --------------- | ------------ | ------------------------------------------- |
| Tesla    | TSLAc           | TSLA perp    | 0xb2000000000000000000001e800a7f5189430cD0  |
| NVIDIA   | NVDAc           | NVDA perp    | 0xb20000000000000000000078ee7ce2fE4908108C  |
| Amazon   | AMZNc           | AMZN perp    | 0xb200000000000000000000d9192b6B456483C2E8  |
| Alphabet | GOOGLc          | GOOGL perp   | 0xb2000000000000000000002D0BA3164cc74f58B7  | 
| Meta     | METAc           | META perp    | 0xb2000000000000000000008bC8786B856E61707C  |
| Apple    | AAPLc           | AAPL perp    | 0xb200000000000000000000d9192b6B456483C2E8  |

The application must maintain a verified configuration mapping between the canonical Base token contract and corresponding Avantis market.

Availability must also be validated dynamically before allowing a hedge.

---

# 5. Target user

The initial user is an onchain investor who:

* Uses Base.
* Holds USDC or tokenized equities.
* Understands wallet transactions.
* Wants exposure to tokenized stocks.
* Wants temporary downside protection.
* Does not want to manually manage perpetual futures.

The MVP is intended for eligible users in jurisdictions where the underlying tokenized-stock and derivative products are available.

---

# 6. Core user journeys

## Journey A: Hedge stocks already in wallet

User connects their wallet.

Hedgr reads Base Mainnet and discovers:

**NVDAc**

Quantity: 8.4
Value: $10,000

The application presents:

**Hedge your NVIDIA**

The user selects:

**100% hedge**

Hedgr calculates:

Stock exposure: +$10,000

Required Avantis position:

NVDA short: approximately -$10,000

The application calculates the USDC margin requirement based on the selected effective leverage and current Avantis parameters.

The user confirms.

The Avantis SDK opens the short position from the user's wallet.

Hedgr then displays the stock and perpetual as one logical hedge.

---

# 7. Buy-and-hedge journey

A user may arrive without owning a supported tokenized stock.

Example:

User wants $5,000 of Tesla exposure.

They select:

**Buy TSLA**

Hedgr embeds the Uniswap experience.

The user swaps:

USDC → TSLAc

The TSLAc arrives directly in the user's wallet.

Hedgr detects the updated balance.

The interface then offers:

**Protect this position**

The user can choose:

25%
50%
75%
100%

Hedgr calculates the corresponding Avantis short.

This creates a simple acquisition funnel:

**USDC → tokenized stock → optional hedge**

without Hedgr taking custody at any point.

---

# 8. Hedge calculation

For a stock position:

**Stock Exposure = Token Quantity × Stock Price**

If the user chooses hedge ratio `H`:

**Target Short Notional = Stock Exposure × H**

Example:

NVDAc value = $10,000

Hedge ratio = 100%

Target Avantis short:

**$10,000**

For a 50% hedge:

**$5,000**

For a 25% hedge:

**$2,500**

---

# 9. Margin and leverage

Avantis currently allows leverage up to the supported limit for each equity market.

Hedgr should not automatically use maximum leverage.

The MVP should default to approximately:

**2.5x effective leverage**

subject to live Avantis parameters.

Example:

Stock exposure: $10,000

Hedge: 100%

Short notional: $10,000

Effective leverage: 2.5x

Approximate required collateral:

**$4,000 USDC**

The application should recommend an additional safety buffer when appropriate.

The user may change leverage within a conservative range supported by the product and Avantis.

The UX should emphasize:

**Margin required**

rather than:

**Leverage available**

because Hedgr is a risk-management product.

---

# 10. Portfolio dashboard

The dashboard is the central product surface.

It combines wallet assets and Avantis positions into a single representation.

Example:

## NVIDIA

**Stock**

NVDAc
8.4 shares
+$10,000 exposure

**Hedge**

Avantis NVDA short
-$9,950 exposure

**Hedge coverage**

99.5%

**Net directional exposure**

+$50

**Margin**

$4,200 USDC

**Margin health**

Healthy

The stock and perpetual remain technically independent.

Hedgr only combines them at the interface/data layer.

---

# 11. Portfolio overview

Users should see all supported positions together.

Example:

| Asset | Stock value | Perp hedge | Coverage | Status   |
| ----- | ----------: | ---------: | -------: | -------- |
| NVDA  |     $10,000 |    -$9,950 |    99.5% | Hedged   |
| TSLA  |      $5,000 |    -$2,500 |      50% | Partial  |
| META  |      $8,000 |         $0 |       0% | Unhedged |

The primary CTA for an unhedged position is:

**Hedge**

For a hedged position:

**Manage hedge**

---

# 12. Hedge drift

Because Hedgr does not custody the stock, the user can move or sell it at any time.

This creates an important condition.

Suppose:

NVDAc wallet position = $10,000

Avantis short = $10,000

Hedge coverage = 100%

The user then sells half their NVDAc.

Their exposure becomes:

NVDAc = +$5,000

Avantis = -$10,000

The user is now approximately:

**-$5,000 net short**

Hedgr must detect this.

Therefore:

**Hedge Coverage = Absolute Perp Short Notional / Stock Exposure**

The dashboard continuously recalculates this value.

---

# 13. Hedge states

The interface should translate hedge ratios into understandable states.

### Unhedged

0% to 10%

### Partially hedged

10% to 90%

### Hedged

90% to 110%

### Overhedged

Above 110%

### Naked short

Stock balance approximately zero while corresponding Avantis short remains open.

Thresholds should be configurable as the product is tested.

---

# 14. Drift warning

Example:

**Your NVIDIA hedge needs attention**

Stock position:

$5,020

Short position:

$9,970

Hedge coverage:

199%

Hedgr should offer:

**Rebalance hedge**

The application calculates the required Avantis position reduction.

The user signs the Avantis transaction.

No Hedgr smart contract is involved.

---

# 15. Architecture

The MVP architecture is intentionally thin.

```text
                   USER WALLET
                        │
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
     Tokenized Stocks              USDC
       Base Mainnet
           │
           │ read balances
           ▼
     ┌───────────────────┐
     │                   │
     │     Hedgr     │
     │                   │
     │ Portfolio Engine  │
     │ Hedge Calculator  │
     │ Risk Dashboard    │
     │                   │
     └─────────┬─────────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
     Avantis         Uniswap
       SDK            Widget
        │              │
        ▼              ▼
   Equity Perps    Buy/Sell B20
```

Hedgr does not sit between the user's wallet and these protocols.

It orchestrates and explains interactions with them.

---

# 16. Frontend architecture

Recommended stack:

**Next.js**

**TypeScript**

**wagmi**

**viem**

Wallet connectivity through an appropriate Base-compatible wallet framework.

Primary frontend modules:

### Wallet module

Connect wallet.

Detect network.

Read USDC.

Read supported B20 balances.

Track balance changes.

### Portfolio engine

Combine:

Base token balances

*

Avantis perpetual positions

into a unified portfolio model.

### Hedge calculator

Calculate:

stock exposure

target hedge

current hedge

hedge coverage

net exposure

required margin

margin health

rebalance amount

### Avantis integration

Use the Avantis SDK/API for:

market discovery

market configuration

prices

open interest

positions

opening shorts

reducing positions

closing positions

margin information

transaction state

### Uniswap integration

Embedded swap functionality for:

USDC → tokenized stock

and potentially:

tokenized stock → USDC

The swap settles directly into the user's wallet.

---

# 17. Backend

The MVP backend should remain lightweight.

Suggested:

**Node.js / TypeScript**

with a small database such as:

**PostgreSQL**

The backend is primarily useful for:

asset configuration

cached market metadata

analytics

notifications

historical hedge snapshots

transaction monitoring

The backend should not be the source of truth for user balances.

Base and Avantis remain the sources of truth.

---

# 18. Data sources

## Base Mainnet

Used for:

wallet balances

B20 token balances

USDC balances

token metadata

transaction confirmation

## Avantis

Used for:

equity perp prices

positions

collateral

leverage

liquidation information

open interest

market availability

trade execution

## Uniswap

Used for:

tokenized-stock swaps

quotes

routing

transaction execution

---

# 19. No Hedgr contracts

The MVP intentionally has:

**0 custom smart contracts**

This significantly reduces:

engineering complexity

audit requirements

custody risk

attack surface

deployment risk

time to market

The user interacts directly with established protocols.

Conceptually:

```text
Hedgr
   │
   ├── READ → Base
   │
   ├── TRADE → Avantis
   │
   └── SWAP → Uniswap
```

Hedgr is therefore primarily an:

**interface + orchestration + risk intelligence product.**

---

# 20. P0 features

The Demo Day prototype must support:

1. Base wallet connection.

2. Detection of the six supported tokenized stocks.

3. USD valuation of those holdings.

4. Detection of existing Avantis equity perp positions.

5. Unified portfolio dashboard.

6. 25%, 50%, 75%, and 100% hedge presets.

7. Hedge calculation.

8. USDC margin requirement calculation.

9. Opening the corresponding Avantis short.

10. Closing the hedge.

11. Hedge coverage calculation.

12. Net exposure calculation.

13. Margin/liquidation health display.

14. Overhedged warnings.

15. Unhedged warnings.

16. Embedded Uniswap stock purchasing.

17. Transaction status and Base explorer links.

---

# 21. P1 features

After the core prototype works:

### Rebalance

Calculate the Avantis adjustment required to return to the target hedge.

User signs the transaction.

### Portfolio hedge

Allow:

**Hedge my portfolio**

Example:

NVDA: $10k
META: $5k
TSLA: $8k

Hedgr prepares the corresponding positions.

### Notifications

Notify users when:

hedge coverage drifts

margin health deteriorates

a stock position disappears

the corresponding perp remains open

market conditions make rebalancing unsafe

---

# 22. What the MVP should not build

Do not build:

custom smart contracts

vaults

pooled liquidity

stock custody

cross-user netting

protocol tokens

lending

automated yield strategies

complex order types

cross-chain functionality

full brokerage functionality

The goal is to validate one question:

**Do tokenized-stock holders want a simple interface for hedging their positions?**

---

# 23. Demo Day experience

The demo should start with a wallet already containing tokenized NVIDIA.

The dashboard immediately shows:

**NVIDIA**

Position: $10,124

Status:

**Unhedged**

The presenter clicks:

**Hedge**

Then:

**100%**

Hedgr shows:

Stock exposure
+$10,124

Proposed Avantis hedge
-$10,124

USDC required
~$4,050 + buffer

Effective leverage
2.5x

The presenter clicks:

**Open hedge**

Wallet confirmation appears.

Avantis executes.

The dashboard changes to:

**HEDGED**

Stock
+$10,124

Short
-$10,101

Hedge coverage
99.8%

Net exposure
+$23

Stock location
**Your wallet**

That should be the core Demo Day moment.

---

# 24. Secondary Demo Day moment

Show someone who does not own the stock.

Click:

**Buy stock**

Select:

**Tesla**

Enter:

$1,000 USDC

The embedded Uniswap experience performs:

USDC → TSLAc

TSLAc appears in the wallet.

Hedgr immediately detects it and asks:

**Want to protect your new Tesla position?**

Then present:

25%

50%

75%

100%

This connects the entire product loop:

**Discover → Buy → Hold → Hedge → Monitor → Unhedge**

---

# 25. Core product metric

The primary MVP metric should not be trading volume.

It should be:

**Hedged notional**

Secondary metrics:

Number of connected wallets with supported assets

Percentage of detected positions that initiate a hedge

Average hedge ratio

Average hedge duration

Repeat hedging users

Average margin committed per dollar hedged

Rebalance frequency

Hedge completion rate

---

# 26. Security model

The security story should be extremely simple:

**Hedgr never takes custody of your stocks.**

**Hedgr does not hold your USDC.**

**Hedgr does not deploy a vault.**

**Hedgr cannot withdraw your portfolio.**

Users sign transactions interacting with Avantis and Uniswap.

This should be prominently communicated in the product.

---

# 27. Main technical risk

The hardest problem is no longer smart-contract engineering.

It is **position reconciliation**.

Hedgr must correctly determine:

> What does this user currently own?

versus:

> What has this user currently hedged?

Every important action should begin by refreshing both.

```text
Base wallet
     │
     │  +$10,000 NVDAc
     ▼

Portfolio Engine

     ▲
     │  -$9,950 NVDA
     │
Avantis
```

The result:

**99.5% hedged**

If either side changes, the dashboard changes.

Never assume the position is still the same because Hedgr previously observed it.

---

# 28. Product moat

The integrations themselves are not the moat.

Anyone can technically combine Base RPC calls with Avantis and Uniswap.

The potential moat comes from making **hedging intelligence invisible to the user**.

Over time Hedgr can become the layer that understands:

wallet exposure

desired risk

hedge ratios

margin efficiency

liquidation risk

carry cost

basis risk

portfolio-level exposure

and eventually recommends the cheapest/safest way to neutralize that risk.

The MVP only needs to prove the first primitive:

> **Connect your wallet, see your stocks, and hedge one in a few clicks.**

---

# 29. MVP architecture summary

```text
                  ┌────────────────────┐
                  │    HEDGR UI    │
                  │                    │
                  │ Portfolio          │
                  │ Hedge calculator   │
                  │ Risk monitoring    │
                  └─────────┬──────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
     BASE MAINNET        AVANTIS            UNISWAP

     Read wallet         Read perps         Swap USDC
     Read B20            Open hedge            ↕
     Read USDC           Modify hedge      B20 stocks
                         Close hedge

          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
                            ▼
                       USER WALLET
```

There is deliberately **no Hedgr smart contract in the middle**.

---

# 30. One-sentence pitch

**Hedgr lets you buy tokenized stocks on Base and hedge their price risk in one click without giving up custody.**

# 31. Demo Day pitch version

**Tokenized stocks are moving onchain, but their risk management hasn't. Hedgr detects the stocks in your wallet and lets you hedge them instantly using onchain perpetuals. Your stocks never leave your wallet.**
