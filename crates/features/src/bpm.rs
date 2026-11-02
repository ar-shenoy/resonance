//! BPM and beat-grid estimation.

use super::TrackFeatures;

pub fn estimate_bpm(_samples: &[f32], _sample_rate: u32) -> Option<f32> {
    None
}

pub fn attach_bpm(features: &mut TrackFeatures, bpm: f32) {
    features.bpm = Some(bpm);
    features.analyzed = true;
}
