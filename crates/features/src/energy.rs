//! Energy / loudness curve extraction.

use super::TrackFeatures;

pub fn estimate_energy_rms(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum_sq: f32 = samples.iter().map(|s| s * s).sum();
    (sum_sq / samples.len() as f32).sqrt()
}

pub fn attach_energy(features: &mut TrackFeatures, energy: f32) {
    features.energy = Some(energy.clamp(0.0, 1.0));
}
