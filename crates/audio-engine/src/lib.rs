//! Resonance Audio Engine
//!
//! Future home of:
//! - Device enumeration & selection
//! - Bit-perfect / exclusive mode paths
//! - Dual-deck players + shared clock
//! - Crossfade & transition engine
//! - DSP effects rack
//! - Optional stem routing
//! - MIDI input mapping

#![allow(dead_code)]

pub struct EngineConfig {
    pub sample_rate: u32,
    pub buffer_size: u32,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            sample_rate: 44100,
            buffer_size: 512,
        }
    }
}

pub fn engine_version() -> &'static str {
    "0.1.0-placeholder"
}
