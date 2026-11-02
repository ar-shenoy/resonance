# Phase 3 & 4 — Status (honest)

## What exists in the repo

### Native scaffold
- `src-tauri/` — Tauri 2 project (config, commands, loads `public/` UI)
- Rust workspace: `audio-engine`, `features`, `db`
- `cpal` integrated for **real device enumeration** in `audio-engine`
- Mixer, DSP slots, MIDI mapper, stems module **types/traits** (not full products)
- Performance-oriented `EngineConfig::performance()` (larger buffer)

### What you can do on your machine

```bash
# Prerequisites: https://v2.tauri.app/start/prerequisites/
cargo install tauri-cli --version "^2"
cd resonance
cargo check -p resonance-audio-engine   # device list via cpal
cargo tauri dev                         # native window + web UI
```

## What is NOT implemented

| Feature | Status |
|---------|--------|
| Full low-latency playback path | Not done |
| Bit-perfect / exclusive mode | Not done |
| Background playback | Not done |
| System media controls | Not done |
| Encrypted sync | Not done |
| Stem separation | Types only |
| Plugin system | Not done |
| MIDI | Types only |
| Room correction / spatial | Not done |
| MusicBrainz / Discogs | Not done |
| P2P sharing | Not done |
| Mobile | Not started |

## Recommended order on your machine

1. `cargo tauri dev` succeeds
2. cpal output stream + decode file (symphonia) → native sound
3. System media controls (e.g. souvlaki)
4. SQLite via `resonance-db`
5. Optional: MIDI, stems, sync

## Design rules

- Core player works fully offline
- No mandatory cloud / GPU
- Advanced features always optional
- Performance mode keeps old devices usable
