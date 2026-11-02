# Resonance

**Local-first music player & intelligent automix engine.**

Resonance is an open-source music application designed for people who still own their music. It combines a high-quality local library player with intelligent, privacy-respecting automation — beat-aware transitions, key matching, energy-aware sets, and deep library understanding — without requiring cloud accounts or remote servers.

---

## Vision

Most modern music apps treat your collection as a secondary concern. Resonance treats it as the primary one.

- Your files stay on your devices.
- Analysis and features run locally by default.
- AI capabilities are progressive and optional — the core player remains fast and usable on modest hardware.
- Creative tools (dual-deck feel, stems-ready architecture, shareable sessions) are first-class, not afterthoughts.

The goal is a player that feels like both a precise instrument and a thoughtful librarian.

## Key Features (Roadmap)

### Now / Early
- Local library scanning & management
- High-quality playback with gapless support
- Modern, fluid interface with dark-first design
- Basic automix using pre-computed features
- Playlist & queue management
- Cross-platform foundation (web prototype → native)

### Coming
- Intelligent feature extraction (BPM, key, energy, structure) performed once at import
- Context-aware and energy-aware continuous mixes
- Dual-deck inspired mixing surface
- Stem isolation architecture
- Semantic search over *your* library
- Shareable session cards and mix exports
- Plugin system for sources, DSP, and visualizations
- Optional encrypted sync (user-controlled)

### Design Principles
- **Local-first** — works fully offline
- **Progressive intelligence** — advanced features degrade gracefully on older devices
- **No mandatory cloud or GPU** — everything essential runs on-device
- **Beautiful by default** — the interface should feel intentional and alive
- **Hackable** — clean architecture, permissive license, clear extension points

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Frontend (UI)                     │
│         Fluid glass surfaces • reactive canvas      │
└────────────────────────┬─────────────────────────────────┘
                       │
┌────────────────────────┴─────────────────────────────────┐
│              Application Layer                      │
│     Library • Queue • Automix Engine • State        │
└────────────────────────┬─────────────────────────────────┘
                       │
┌────────────────────────┴─────────────────────────────────┐
│                 Core Services                       │
│  Audio Engine │ Feature Cache │ Metadata │ Storage  │
└────────────────────────┬─────────────────────────────────┘
                       │
┌────────────────────────┴─────────────────────────────────┐
│              Local Persistence                      │
│         SQLite + filesystem (audio files)           │
└─────────────────────────────────────────────────────────┘
```

Heavy analysis happens at import time or in background. Runtime decisions use cached features + lightweight algorithms so the player stays responsive even on older phones.

## Getting Started

### Current Prototype

The repository currently contains a high-fidelity interactive prototype of the interface and basic player shell. Open `public/index.html` in a modern browser to explore the UI direction.

```bash
# Simply open the prototype
open public/index.html
# or serve it
npx serve public
```

### Future Development

A Rust-based core + Tauri frontend is planned for the native experience. The web prototype serves as the living design reference and interaction model.

## License

MIT License — see [LICENSE](LICENSE).

## Status

Early development. The foundation is being laid for a serious local-first music tool. Contributions, ideas, and feedback are welcome once the core architecture stabilizes.

---

**Resonance** — music that stays yours.
