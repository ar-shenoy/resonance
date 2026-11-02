//! Stem separation foundation.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StemKind {
    Vocals,
    Drums,
    Bass,
    Other,
}

#[derive(Debug, Clone)]
pub struct StemSet {
    pub vocals: Option<Vec<f32>>,
    pub drums: Option<Vec<f32>>,
    pub bass: Option<Vec<f32>>,
    pub other: Option<Vec<f32>>,
}

pub fn separate_placeholder(_samples: &[f32], _sample_rate: u32) -> StemSet {
    StemSet {
        vocals: None,
        drums: None,
        bass: None,
        other: None,
    }
}
