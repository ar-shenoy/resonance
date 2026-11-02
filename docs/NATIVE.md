# Building Resonance Natively (Tauri 2)

The web prototype in `public/` is the design and interaction reference.  
The native app lives under `src-tauri/` and the Rust crates in `crates/`.

## Prerequisites

- Rust 1.75+ (preferably latest stable)
- Node.js 18+
- Platform dependencies for Tauri 2:
  - **Linux**: `webkit2gtk`, `libgtk-3`, `librsvg`, etc.  
    See https://v2.tauri.app/start/prerequisites/
  - **macOS**: Xcode Command Line Tools
  - **Windows**: WebView2 + Visual Studio Build Tools

```bash
# Install Tauri CLI
cargo install tauri-cli --version "^2"
```

## Development

```bash
cd resonance

# Terminal 1 — serve the frontend
npx serve public -p 5173

# Terminal 2 — run the native shell
cargo tauri dev
```

## Available Rust commands (scaffold)

| Command | Purpose |
|---------|--------|
| `get_app_info` | Returns app + crate versions |
| `list_audio_devices` | Placeholder device list |

## Crate map

| Crate | Role |
|-------|------|
| `resonance-audio-engine` | Devices, mixer, DSP, MIDI |
| `resonance-features` | BPM, key, energy, stems |
| `resonance-db` | SQLite library store |

## Phase 3 / 4 implementation order

1. Wire **cpal** into `audio-engine`
2. System media controls
3. Background playback
4. SQLite via `resonance-db`
5. Better analysis
6. Optional: stems, MIDI, plugins, sync

## Constraints

- Core experience must work **fully offline**
- No mandatory cloud or remote GPU
- Performance mode must keep the app usable on old hardware

## Current status

This is a **scaffold**. The web prototype remains the working player.
