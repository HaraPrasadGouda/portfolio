# Hara Prasad Gouda: Portfolio

**Live:** https://haraprasadgouda.github.io/portfolio/

A one-page developer portfolio built for the **One Who Codes 2026** challenge. It opens with a short terminal intro, then my name is compiled out of particles that drift into the night sky.

## What is on the page
- Animated hero: a WebGL particle name, a typed terminal intro (with a Skip button) and a photo card hanging from a thread
- The photo card reacts: double-tap it, pull it down or sideways and let go, and it shoots up and swings back. On scroll the thread is cut and the card flies down, flips into the CampusDebug OS project card, then flips again into the About card
- A scroll-driven particle object that morphs between shapes
- Selected work (Scam Shield, SubTrack, CampusDebug OS), each opening a case study: problem, what I built, tech, result
- A command menu: press `/` (or the `/` button in the nav) to jump to any section or project
- A hidden interactive terminal: press `t`, then try `help`, `projects`, `whoami`, `cat about.md`
- About section as a bento grid whose cards fly in on scroll
- Skills lines that keep moving, and contact links (GitHub, LinkedIn)

## Original effects
Every effect is written from scratch in plain JavaScript and WebGL/Canvas: the particle name, the terminal intro, the scroll-driven orb, the flying photo card with its spring, the case-study popups, the command menu and the scroll reveals. There are no animation libraries and no template code.

## Tech
HTML, CSS, vanilla JavaScript and WebGL. No build step and no dependencies. Fonts: Unbounded and IBM Plex Mono (Google Fonts).

## Run it
Open `index.html` in a browser, or serve the folder with any static server, for example `npx serve .` — or just use `npm run dev` (Vite). The live site deploys automatically from `main` via GitHub Pages.

## Phones and accessibility
- Lighter particle count and pixel ratio on phones and touch devices
- Respects `prefers-reduced-motion`
- Keyboard focus styles, keyboard-reachable project cards and a readable skill list for screen readers

## License
MIT, see `LICENSE`.
