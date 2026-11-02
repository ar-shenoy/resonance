//! MIDI controller support foundation.

use super::mixer::DeckId;

#[derive(Debug, Clone)]
pub struct MidiMessage {
    pub status: u8,
    pub data1: u8,
    pub data2: u8,
}

#[derive(Debug, Clone)]
pub enum MidiAction {
    PlayPause(DeckId),
    Cue(DeckId, u8),
    Crossfader(f32),
    Volume(DeckId, f32),
    Tempo(DeckId, f32),
    Custom(String),
}

pub trait MidiMapper {
    fn map(&self, msg: &MidiMessage) -> Option<MidiAction>;
}

pub struct NullMapper;

impl MidiMapper for NullMapper {
    fn map(&self, _msg: &MidiMessage) -> Option<MidiAction> {
        None
    }
}
