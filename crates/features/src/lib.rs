//! Resonance Feature Extraction

#![allow(dead_code)]

pub mod bpm;
pub mod key;
pub mod energy;
pub mod stems;

#[derive(Debug, Clone, Default)]
pub struct TrackFeatures {
    pub bpm: Option<f32>,
    pub key: Option<String>,
    pub energy: Option<f32>,
    pub beat_grid: Option<Vec<f64>>,
    pub analyzed: bool,
}

pub fn features_version() -> &'static str {
    "0.1.0-scaffold"
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AnalysisQuality {
    Low,
    Medium,
    High,
}
