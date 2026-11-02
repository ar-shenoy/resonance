# Resonance Roadmap

## Phase 1 — Usable Local Player
- [x] Local file import & playback
- [x] Basic library
- [x] Transport controls
- [x] Feature extraction (BPM / energy / key approximation)
- [x] Dual-deck + Automix foundation
- [x] Playlists, favorites, history, search
- [x] Settings + keyboard shortcuts
- [x] IndexedDB persistence (metadata + user data)
- [x] Duplicate detection + corrupt file handling
- [ ] Cover art & real metadata (ID3/Vorbis)
- [ ] Lyrics view
- [ ] Full permanent file library (needs native)

## Phase 2 — Creative Power
- [ ] Better analysis (beat grid, structure)
- [ ] True beatmatching transitions
- [ ] Hot cues, loops, pitch/tempo
- [ ] Effects rack
- [ ] Session export / share cards
- [ ] Version-aware library (original vs remaster)

## Phase 3 — Native (scaffolded)
- [x] Tauri 2 project structure (`src-tauri/`)
- [x] Rust workspace crates (audio-engine, features, db)
- [x] Device / mixer / DSP / MIDI module layout
- [x] Stem separation module placeholder
- [ ] cpal integration + real device selection
- [ ] Low-latency playback path
- [ ] Background playback + system media controls
- [ ] Performance mode wired to native engine
- [ ] Optional encrypted sync

## Phase 4 — Advanced (designed, not implemented)
- [ ] Stem separation (optional local ONNX models)
- [ ] Plugin system
- [ ] MIDI controller support (`midir`)
- [ ] Room correction / headphone personalization
- [ ] Spatial / multi-channel
- [ ] MusicBrainz / Discogs enrichment
- [ ] Peer-to-peer library sharing
- [ ] Mobile path

## Design Constraints (permanent)
- No mandatory cloud or remote GPU
- Core experience works fully offline
- Analysis is progressive and can be disabled
- Privacy by default
