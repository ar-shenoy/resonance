# Resonance Architecture

## Current State (v0.4)

The living prototype is a high-fidelity **web application** (`public/`) that demonstrates:

- Local file playback
- Feature extraction (BPM, energy, key approximation)
- Dual-deck + Automix
- Playlists, favorites, history, search, settings

This prototype is the design and interaction reference.

## Target Architecture (Native)

```
resonance/
├── crates/
│   ├── audio-engine/     # Low-latency playback, mixing, DSP, device management
│   ├── features/         # Analysis pipeline (BPM, key, energy, structure, embeddings)
│   ├── db/               # SQLite schema, migrations, queries
│   └── ui/               # Shared UI logic / state (future)
├── src-tauri/            # Tauri 2 shell (desktop)
├── public/               # Current web prototype (design reference)
├── docs/
└── .github/workflows/
```

### Principles

1. **Local-first** — core features never require network
2. **Progressive intelligence** — analysis quality adapts to device capability
3. **Plugin-friendly** — DSP, sources, visualizations, and UI modules should be extensible
4. **Privacy by default** — optional sync is user-controlled and encrypted

### Planned Crates

| Crate | Responsibility |
|-------|----------------|
| `audio-engine` | cpal/miniaudio backend, dual-deck, crossfade, effects, device selection |
| `features` | Offline analysis, feature cache, future ONNX models |
| `db` | SQLite, track/playlist/history schema, migrations |
| `ui` | Shared state & commands between frontend and core |

### Advanced Features Roadmap

| Feature | Approach | Priority |
|---------|----------|----------|
| Stem separation | Optional local model (ONNX) or lighter classical methods first | Medium |
| Plugin system | Dynamic library / WASM plugins for DSP & visualizations | Medium |
| Encrypted sync | User-provided S3 / Nextcloud / custom server | Later |
| P2P sharing | Optional, consent-based | Later |
| Room correction | Measurement + FIR filters in audio-engine | Later |
| Spatial / multi-channel | Native device support | Later |
| MIDI controllers | midir + mapping layer | Later |
| Lyrics + karaoke | LRC / embedded lyrics + timed view | Near-term |
| MusicBrainz / Discogs | Online enrichment (optional) | Near-term |
| Version-aware library | Track `version` / `master` metadata | Near-term |

### Performance Tiers

- **Low-end**: Classical DSP only, reduced analysis, performance mode on
- **Mid**: Small quantized models
- **High**: Full local models + optional GPU

No remote GPU or cloud database is required for core functionality.
