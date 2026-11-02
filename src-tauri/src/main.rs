#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! Resonance — Tauri 2 entry point

use serde::Serialize;

#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
    engine: &'static str,
    features: &'static str,
    db: &'static str,
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Resonance",
        version: env!("CARGO_PKG_VERSION"),
        engine: resonance_audio_engine::engine_version(),
        features: resonance_features::features_version(),
        db: resonance_db::db_version(),
    }
}

#[tauri::command]
fn list_audio_devices() -> Vec<String> {
    resonance_audio_engine::list_devices_placeholder()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_app_info, list_audio_devices])
        .run(tauri::generate_context!())
        .expect("error while running Resonance");
}
