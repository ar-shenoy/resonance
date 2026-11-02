//! Musical key detection.

use super::TrackFeatures;

pub fn estimate_key(_samples: &[f32], _sample_rate: u32) -> Option<String> {
    None
}

pub fn attach_key(features: &mut TrackFeatures, key: impl Into<String>) {
    features.key = Some(key.into());
}
