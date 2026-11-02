# Resonance Roadmap

## Phase 1 — Usable Local Player (current prototype)
- [x] Local file import & playback
- [x] Basic library
- [x] Transport controls
- [x] Feature extraction (BPM / energy / key approximation)
- [x] Dual-deck + Automix foundation
- [x] Playlists, favorites, history, search
- [x] Settings + keyboard shortcuts
- [ ] Cover art & real metadata
- [ ] Persistent storage (IndexedDB → SQLite)
- [ ] Lyrics view

## Phase 2 — Creative Power
- [ ] Better analysis (beat grid, structure)
- [ ] True beatmatching transitions
- [ ] Hot cues, loops, pitch/tempo
- [ ] Effects rack
- [ ] Session export / share cards
- [ ] Version-aware library (original vs remaster)

## Phase 3 — Native
- [ ] Tauri 2 desktop shell
- [ ] Rust audio-engine (device selection, low latency)
- [ ] Background playback + system media controls
- [ ] Performance mode for low-end devices
- [ ] Optional encrypted sync

## Phase 4 — Advanced
- [ ] Stem separation (optional local models)
- [ ] Plugin system
- [ ] MIDI controller support
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
