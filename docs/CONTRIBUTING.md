# Contributing to Resonance

Thank you for your interest in contributing.

## Project Status

Resonance is in early development. The current `public/` folder contains a working web prototype that serves as the design and interaction reference. The long-term direction is a native app (Tauri 2 + Rust core).

## How to Run the Prototype

```bash
git clone https://github.com/ar-shenoy/resonance.git
cd resonance
npx serve public
```

Open the printed URL and import local audio files.

## Development Guidelines

1. **Local-first** — Do not introduce mandatory network calls for core features.
2. **Progressive enhancement** — Advanced features should degrade gracefully.
3. **Keep the prototype usable** — Changes to `public/` should remain playable.
4. **Clear separation** — Analysis, audio engine, and UI should stay loosely coupled.

## Code Style

- JavaScript: modern ES modules style, clear function names, minimal global state.
- Future Rust: standard `rustfmt` + `clippy`.
- Prefer small, focused commits with descriptive messages.

## Areas That Need Help

- Better BPM / key / structure analysis
- Cover art & metadata extraction
- IndexedDB / SQLite persistence
- Accessibility improvements
- Tests for analysis and mixing logic
- Documentation and examples
- Tauri + Rust core scaffolding

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the prototype still runs
5. Open a PR with a clear description of what and why

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
