//! Resonance Audio Engine

#![allow(dead_code)]

pub mod device;
pub mod mixer;
pub mod dsp;
pub mod midi;

pub use device::*;
pub use mixer::*;

pub fn engine_version() -> &'static str {
    "0.1.0-scaffold"
}

pub fn list_devices_placeholder() -> Vec<String> {
    vec![
        "System Default".into(),
        "(Native device list requires cpal + running on host)".into(),
    ]
}

#[derive(Debug, Clone)]
pub struct EngineConfig {
    pub sample_rate: u32,
    pub buffer_size: u32,
    pub performance_mode: bool,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            sample_rate: 44100,
            buffer_size: 512,
            performance_mode: false,
        }
    }
}
