//! Dual-deck mixer and transition engine.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DeckId {
    A,
    B,
}

#[derive(Debug, Clone)]
pub struct DeckState {
    pub track_id: Option<String>,
    pub playing: bool,
    pub position_secs: f64,
    pub volume: f32,
    pub tempo_ratio: f32,
    pub key_lock: bool,
}

impl Default for DeckState {
    fn default() -> Self {
        Self {
            track_id: None,
            playing: false,
            position_secs: 0.0,
            volume: 0.8,
            tempo_ratio: 1.0,
            key_lock: false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct MixerState {
    pub deck_a: DeckState,
    pub deck_b: DeckState,
    pub crossfader: f32,
}

impl Default for MixerState {
    fn default() -> Self {
        Self {
            deck_a: DeckState::default(),
            deck_b: DeckState::default(),
            crossfader: 0.5,
        }
    }
}

pub fn crossfade_gains(x: f32) -> (f32, f32) {
    let x = x.clamp(0.0, 1.0);
    let gain_a = ((1.0 - x) * 0.5 * std::f32::consts::PI).cos();
    let gain_b = (x * 0.5 * std::f32::consts::PI).sin();
    (gain_a, gain_b)
}
