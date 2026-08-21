# Pravin Agarwal Website Design System V1

This document is the implementation source of truth for the current website foundation.

## Concept

The site is a cinematic personal portfolio for Pravin Agarwal, an automotive professional working across automotive, strategy, product, and building.

The central concept is trajectory: Movement -> Experience -> Perspective -> Building -> Direction.

The experience should feel premium, precise, human, ambitious, sophisticated, and forward-looking. It should not feel like a resume, generic portfolio, consulting site, startup landing page, car dealership site, or WebGL showcase.

## Palette

- Deep Navy: `#07111F`
- Warm Beige / Ivory: `#F4EFE4`
- Champagne: `#C8A978`

Supporting colors are tonal extensions of those foundations only. Do not introduce unrelated accent colors.

## Typography

- Display: Instrument Serif
- Body / UI: Inter
- Technical metadata: IBM Plex Mono

Use Instrument Serif for editorial and human moments, Inter for modern precision, and IBM Plex Mono sparingly for chapter numbers, dates, locations, metadata, and small labels.

## Layout

The layout uses a full-bleed plus 12-column hybrid.

- Full-bleed: hero moments, cinematic images, major transitions.
- 12-column grid: text, project presentation, structured editorial content.
- Editorial text should use controlled line lengths.
- Sections should vary in density. The rhythm is emotion -> information -> emotion -> information.

## Shape And Borders

- Border radius stays between 2px and 6px.
- Borders are almost invisible and structural.
- Avoid large rounded cards, pills, glassmorphism, heavy outlines, and decorative frames.

## Motion

Motion is cinematic and precise.

- Precise: navigation states, structure, project transitions, alignment.
- Cinematic: hero reveals, photography, personal chapters, section entrances.

Avoid scroll hijacking, excessive parallax, bouncing, particles, constant loops, long loaders, and motion without narrative purpose.

## Components

The system includes foundations for:

- Fixed navigation and chapter indicator
- Section shells and 12-column grids
- Editorial typography
- Understated buttons and text links
- Project presentation
- Reveal utilities
- Cinematic media treatments

## Responsive Principles

Desktop is the primary cinematic experience. Mobile keeps the same narrative and identity while simplifying motion and complex compositions.

On mobile:

- Preserve hierarchy and generous spacing.
- Reduce scroll-driven animation.
- Keep navigation accessible.
- Keep text readable and line lengths controlled.

## Tokens

Implementation tokens live in `tokens.css`. If a value is part of the visual system, add or reuse a token instead of hard-coding random values inside components.
