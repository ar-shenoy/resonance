//! DSP effects rack foundation.

#[derive(Debug, Clone, Copy)]
pub enum EffectKind {
    Filter,
    Reverb,
    Delay,
    Eq,
    Gain,
}

#[derive(Debug, Clone)]
pub struct EffectSlot {
    pub kind: EffectKind,
    pub enabled: bool,
    pub params: Vec<f32>,
}

pub fn process_placeholder(input: &[f32], output: &mut [f32], _slots: &[EffectSlot]) {
    output.copy_from_slice(input);
}
