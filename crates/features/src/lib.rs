//! Resonance Feature Extraction
//!
//! Future home of:
//! - BPM + beat grid
//! - Key detection
//! - Energy / loudness curves
//! - Structure segmentation
//! - Embeddings for semantic search
//! - Progressive quality tiers

#![allow(dead_code)]

#[derive(Debug, Clone, Default)]
pub struct TrackFeatures {
    pub bpm: Option<f32>,
    pub key: Option<String>,
    pub energy: Option<f32>,
    pub analyzed: bool,
}

pub fn features_version() -> &'static str {
    "0.1.0-placeholder"
}
