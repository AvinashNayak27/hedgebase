# Design and Style Guide

## Design Direction

Create a calm, premium financial product that feels approachable rather than technical.

The interface should communicate clarity, confidence, and safety. Complex financial or technical infrastructure should stay in the background unless the user explicitly asks for more detail.

The overall experience should feel closer to a modern consumer finance product than a professional trading terminal.

---

# Product Clarity

## The Tiny App-Builder Test

Open the app and remove the landing page from your brain.

A new user should be able to understand the product promise from the first meaningful screen alone.

They do not need to understand every feature or mechanism. They should understand three things:

**What is this?**

The product category and core purpose should be apparent.

**Why should I care?**

The primary benefit should be visible without requiring onboarding, documentation, or marketing copy.

**What do I do next?**

There should be an obvious first action.

If any of these are blurry, do not solve the problem by adding more features, cards, explanations, or navigation.

Make a sharper product decision.

The first screen is not just a dashboard. It is part of the product explanation.

---

# Core UX Principles

## Calm by Default

Keep screens visually quiet.

Avoid excessive market movement, flashing states, dense charts, competing metrics, or large amounts of technical information.

Use whitespace generously and allow important information to stand on its own.

## Human Language First

Describe outcomes rather than implementation details.

Prefer concepts users naturally understand, such as:

* portfolio value
* protection
* amount protected
* exposure
* required funds
* risk
* holdings

Keep specialized terminology behind progressive disclosure.

## Progressive Disclosure

Structure information in layers.

**Primary**

Show what the user needs to understand and complete the current task.

**Secondary**

Provide short explanations for users who want more context.

**Advanced**

Expose technical mechanics, execution information, protocol details, and other specialist information.

Advanced information should never compete visually with the primary experience.

## One Clear Action

Each screen should have one visually dominant action.

Secondary actions should have significantly less visual weight.

Avoid presenting several equally prominent buttons.

## Outcome-Oriented Interactions

Design controls around the outcome the user wants rather than the underlying mechanism.

Users should feel like they are choosing an outcome, not configuring infrastructure.

---

# Drop Sheets

Use drop sheets as the preferred interaction pattern for focused actions that should not require leaving the user's current context.

A drop sheet should feel like a temporary layer of intent over the current screen.

Appropriate uses include:

* choosing an amount
* adjusting a setting
* selecting protection or coverage
* reviewing a simple action
* choosing between a small number of options
* viewing contextual details
* confirming a lightweight decision

Avoid navigating to an entirely new screen when a drop sheet can complete the interaction clearly.

## Drop Sheet Structure

A drop sheet should generally contain:

**Context**

A short title that explains what the user is changing.

**Primary control**

The input, slider, selector, or choice that represents the decision.

**Immediate consequence**

Show what the selected choice means.

**Primary action**

One clear button to continue or confirm.

**Optional secondary information**

Place explanations or advanced details below the main interaction.

The hierarchy should remain obvious even when the sheet contains several pieces of information.

## Drop Sheet Behavior

Drop sheets should:

* emerge from the bottom of the interface
* preserve enough of the previous screen to maintain context
* use large rounded top corners
* use a solid, calm surface
* provide generous internal spacing
* support swipe or explicit dismissal when safe
* keep the primary action easy to reach
* resize gracefully for keyboards and smaller screens

For longer flows, allow the sheet to expand toward full-screen rather than forcing content into a cramped panel.

## Drop Sheet Depth

Do not stack sheets indefinitely.

A sheet may reveal additional information inside itself through expansion or progressive disclosure.

If an interaction becomes a substantial workflow, promote it to a dedicated screen.

Use this rule:

> Small decision, drop sheet.
> Significant journey, screen.

## Drop Sheet Content

Do not treat drop sheets as miniature pages.

Remove unnecessary:

* navigation
* repeated headings
* explanatory paragraphs
* decorative cards
* secondary metrics
* competing actions

The sheet should focus on the decision that caused it to appear.

---

# Visual Language

## Overall Mood

The visual system should feel:

* calm
* modern
* premium
* trustworthy
* soft
* spacious
* approachable
* financially sophisticated without appearing institutional

Avoid aesthetics associated with speculative trading products.

---

# Color

## Accent Color

Reserve the primary accent for actions and intentional moments of emphasis.

Use it for:

* primary buttons
* active navigation
* selected controls
* important calls to action
* focused interactive elements

Do not use the accent color as a generic financial-state indicator.

## Positive State

Use a soft green treatment for:

* protected
* healthy
* successful
* completed
* low-risk states

Prefer subtle tinted backgrounds over highly saturated surfaces.

## Attention State

Use muted amber for situations that deserve attention but are not dangerous.

## Risk State

Reserve muted red for genuine problems or elevated risk.

Red should be relatively rare so that it retains meaning.

## Neutral Palette

Build most of the interface from:

* warm white
* off-white
* very light gray
* charcoal
* muted gray

Most cards should remain neutral.

Color should communicate meaning rather than decorate every surface.

---

# Typography

Use a clean modern sans-serif typeface.

Typography should feel slightly editorial rather than technical.

Create clear hierarchy between:

* primary values
* screen titles
* card titles
* body copy
* supporting metadata

Use medium and semibold weights for emphasis.

Avoid excessive bold text.

Avoid monospace typography in the primary experience unless the information genuinely benefits from it.

---

# Spacing

Use a consistent spacing system throughout the product.

Favor generous spacing over dense layouts.

Maintain comfortable separation between:

* sections
* cards
* labels and values
* controls
* navigation elements

Cards should have substantial internal padding.

Screen edges should have enough breathing room that content never feels pressed against the device frame.

---

# Cards

Cards are a primary structural element.

They should feel almost physical while remaining minimal.

Use:

* large corner radii
* generous padding
* white or subtly tinted surfaces
* extremely soft shadows
* little or no visible border

Avoid:

* heavy outlines
* strong drop shadows
* excessive nested cards
* small cramped cards

A card should generally represent one clear concept.

---

# Shadows and Borders

Shadows should be barely noticeable.

Their purpose is to establish hierarchy rather than create dramatic depth.

Avoid borders where spacing, background contrast, or elevation can provide sufficient separation.

When a border is necessary, keep it subtle.

---

# Buttons

## Primary

Primary buttons should:

* use the main accent treatment
* have strong contrast
* use rounded corners
* feel substantial
* contain concise action-oriented labels

## Secondary

Secondary actions should use neutral treatments with clearly lower visual emphasis.

## Tertiary

Use simple text actions for optional or informational paths.

Avoid making tertiary actions compete with the primary action.

---

# Status Components

Status indicators should combine:

* color
* iconography
* text

Never communicate an important state through color alone.

Use compact rounded status pills for states such as:

* protected
* healthy
* pending
* needs attention
* at risk

---

# Progress and Selection

Use visual progress indicators when communicating how much of something is covered, completed, allocated, or protected.

Appropriate patterns include:

* circular progress rings
* horizontal progress bars
* sliders
* percentage labels

These indicators should communicate completion or coverage rather than resemble trading gauges.

---

# Charts

Charts should be secondary to the user's position and primary task.

Prefer:

* simple line charts
* minimal labels
* subtle grid lines or no grid
* lightweight time controls
* restrained animation

Avoid making charts the visual center of general overview screens.

---

# Icons

Use a consistent rounded icon system.

Prefer:

* outline icons
* soft filled icons
* consistent stroke widths
* minimal internal detail

Use recurring metaphors consistently.

Do not introduce multiple symbols for the same concept.

---

# Navigation

Keep primary navigation minimal.

Use a small set of high-level destinations.

Navigation labels should describe user goals rather than technical product architecture.

Avoid overcrowding navigation with specialist features.

---

# Forms and Inputs

Inputs should feel simple and forgiving.

Make the primary value visually prominent.

Clearly identify units.

Show resulting values nearby.

Update estimates immediately when possible.

When parameters can be derived automatically, derive them instead of asking the user to configure them.

---

# Confirmation

Before an important action, provide a concise review.

Clearly summarize:

* what is changing
* what is affected
* the resulting state
* requirements
* important consequences

Keep implementation details secondary.

---

# Success States

Success screens should provide a clear sense of completion without excessive celebration.

Use:

* a simple success icon
* concise confirmation
* the new state
* one clear next action

The user should immediately understand what changed.

---

# Content Style

Use concise, plain language.

Prefer short labels and sentences.

Write from the user's perspective.

Describe outcomes before mechanisms.

Avoid unnecessary jargon.

When jargon is unavoidable, explain it where it appears.

---

# Technical Information

Technical details should be available without becoming the primary mental model.

Use expandable areas such as:

**How does this work?**

for conceptual explanations.

Use:

**Advanced**

for specialist information.

Complexity should be available, not imposed.

---

# Motion

Motion should be subtle and purposeful.

Use motion for:

* state transitions
* progress
* drop sheets
* selection feedback
* completion
* navigation

Avoid decorative movement that competes with important information.

---

# Accessibility

Maintain strong text contrast.

Interactive targets should be comfortably tappable.

Do not rely on color alone to communicate state.

Pair important states with text and icons.

Support keyboard navigation, visible focus states, screen readers, dynamic text sizing, and reduced-motion preferences where applicable.

---

# Product Personality

The interface should communicate:

> Sophisticated infrastructure made simple.

The product should quietly handle complexity while giving the user clear control over outcomes.

The user should understand the benefit before they understand the machinery.

---

# Avoid

Do not default to:

* trading-terminal layouts
* candlestick charts
* order books
* flashing prices
* aggressive green and red
* neon crypto aesthetics
* specialist terminology
* dense financial tables
* technical architecture as navigation
* excessive gradients
* glassmorphism everywhere
* tiny metadata-heavy cards
* excessive badges
* unnecessary metrics

---

# Final Design Check

Before adding another feature, remove all marketing context and look only at the product.

Ask:

**What is this?**

**Why should I care?**

**What do I do next?**

Then inspect the visual hierarchy.

Can the user answer those questions from what the interface emphasizes, not just from explanatory copy?

If the answer is no, simplify.

Do not add another feature to compensate for an unclear product.

Make the existing decision sharper.

---

# Design Summary

Prioritize:

**User intent over product architecture**

**Outcomes over mechanisms**

**Whitespace over density**

**Hierarchy over decoration**

**Soft surfaces over borders**

**Meaningful color over colorful UI**

**Clear actions over configuration**

**Drop sheets over unnecessary navigation**

**Progressive disclosure over information overload**

**Product clarity over feature count**

The interface should explain the product through its structure, not depend on a landing page to explain it.
