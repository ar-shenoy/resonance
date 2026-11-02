//! Resonance Audio Engine
//!
//! - Device enumeration & selection (cpal)
//! - Dual-deck mixer foundation
//! - DSP effects slots
//! - MIDI mapping foundation

#![allow(dead_code)]

pub mod device;
pub mod mixer;
pub mod dsp;
pub mod midi;

pub use device::{list_output_devices, AudioDevice, CpalBackend, DeviceBackend, DeviceError};
pub use mixer::{crossfade_gains, DeckId, DeckState, MixerState};

pub fn engine_version() -> &'static str {
    "0.2.0-cpal"
}

pub fn list_devices_placeholder() -> Vec<String> {
    match list_output_devices() {
        Ok(devices) => devices
            .into_iter()
            .map(|d| {
                if d.is_default {
                    format!("{} (default)", d.name)
                } else {
                    d.name
                }
            })
            .collect(),
        Err(e) => vec![format!("Error listing devices: {e}")],
    }
}

#[derive(Debug, Clone)]
pub struct EngineConfig {
    pub sample_rate: u32,
    pub buffer_size: u32,
    pub performance_mode: bool,
    pub exclusive: bool,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            sample_rate: 44100,
            buffer_size: 512,
            performance_mode: false,
            exclusive: false,
        }
    }
}

impl EngineConfig {
    pub fn performance() -> Self {
        Self {
            sample_rate: 44100,
            buffer_size: 1024,
            performance_mode: true,
            exclusive: false,
        }
    }
}
