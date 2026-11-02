//! Audio device enumeration and selection via cpal.

use cpal::traits::{DeviceTrait, HostTrait};

#[derive(Debug, Clone)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
    pub max_channels: u16,
    pub sample_rates: Vec<u32>,
}

#[derive(Debug, thiserror::Error)]
pub enum DeviceError {
    #[error("no default output device")]
    NoDefaultDevice,
    #[error("cpal error: {0}")]
    Cpal(String),
}

pub fn list_output_devices() -> Result<Vec<AudioDevice>, DeviceError> {
    let host = cpal::default_host();
    let default_name = host
        .default_output_device()
        .and_then(|d| d.name().ok());

    let mut devices = Vec::new();

    let iter = host
        .output_devices()
        .map_err(|e| DeviceError::Cpal(e.to_string()))?;

    for device in iter {
        let name = device.name().unwrap_or_else(|_| "Unknown".into());
        let is_default = default_name.as_ref() == Some(&name);

        let mut max_channels = 2u16;
        let mut sample_rates = Vec::new();

        if let Ok(configs) = device.supported_output_configs() {
            for config in configs {
                max_channels = max_channels.max(config.channels());
                let min_sr = config.min_sample_rate().0;
                let max_sr = config.max_sample_rate().0;
                for sr in [min_sr, 44100, 48000, max_sr] {
                    if sr >= min_sr && sr <= max_sr && !sample_rates.contains(&sr) {
                        sample_rates.push(sr);
                    }
                }
            }
        }
        sample_rates.sort_unstable();

        devices.push(AudioDevice {
            id: name.clone(),
            name,
            is_default,
            max_channels,
            sample_rates,
        });
    }

    if devices.is_empty() {
        devices.push(AudioDevice {
            id: "default".into(),
            name: "System Default".into(),
            is_default: true,
            max_channels: 2,
            sample_rates: vec![44100, 48000],
        });
    }

    Ok(devices)
}

pub fn default_output_device_name() -> Option<String> {
    cpal::default_host()
        .default_output_device()
        .and_then(|d| d.name().ok())
}

pub trait DeviceBackend {
    fn list_output_devices(&self) -> Result<Vec<AudioDevice>, DeviceError>;
    fn list_input_devices(&self) -> Result<Vec<AudioDevice>, DeviceError>;
}

pub struct CpalBackend;

impl DeviceBackend for CpalBackend {
    fn list_output_devices(&self) -> Result<Vec<AudioDevice>, DeviceError> {
        list_output_devices()
    }

    fn list_input_devices(&self) -> Result<Vec<AudioDevice>, DeviceError> {
        Ok(vec![])
    }
}
