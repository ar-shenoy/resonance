# Resonance

**Local-first music player & intelligent automix engine.**

Resonance is an open-source music application for people who own their music. It combines high-quality local playback with intelligent, privacy-respecting automation — without requiring cloud accounts or remote servers.

---

## Current Status

**v0.4 — Web Prototype**

The `public/` folder contains a fully usable interactive prototype:

- Local audio import (drag & drop or file picker)
- Real playback with transport controls
- Feature extraction (BPM, energy, key approximation)
- Dual-deck interface + Automix with crossfades
- Playlists, favorites, history, search
- Settings (performance mode, accent themes, context modes)
- Keyboard shortcuts

```bash
git clone https://github.com/ar-shenoy/resonance.git
cd resonance
npx serve public
```

Then open the URL and import your music files.

---

## Vision

- Your files stay on your devices
- Analysis runs locally
- AI features are progressive and optional
- Creative tools (dual-deck, automix, sessions) are first-class
- No mandatory cloud or GPU

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md) for details.

---

## Project Structure

```
resonance/
├── public/                 # Living web prototype (design reference)
├── crates/
│   ├── audio-engine/       # Future native audio core
│   ├── features/           # Future analysis pipeline
│   └── db/                 # Future SQLite layer
├── docs/                   # Architecture, roadmap, contributing
├── assets/                 # Logo and static assets
└── .github/workflows/      # CI
```

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

Help is especially welcome on:

- Better analysis algorithms
- Metadata & cover art
- Persistence
- Accessibility
- Tauri + Rust core

---

## License

MIT — see [LICENSE](LICENSE).

---

**Resonance** — music that stays yours.
