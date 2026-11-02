//! Resonance Database

#![allow(dead_code)]

#[derive(Debug, Clone)]
pub struct TrackRecord {
    pub id: String,
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration_secs: f64,
    pub version: String,
    pub bpm: Option<f32>,
    pub key: Option<String>,
    pub energy: Option<f32>,
}

pub fn db_version() -> &'static str {
    "0.1.0-scaffold"
}

pub struct Database;

impl Database {
    pub fn open_placeholder(_path: &str) -> Self {
        Self
    }
}
