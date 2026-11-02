//! Audio device enumeration and selection.

#[derive(Debug, Clone)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
    pub max_channels: u16,
}

pub trait DeviceBackend {
    fn list_output_devices(&self) -> Vec<AudioDevice>;
    fn list_input_devices(&self) -> Vec<AudioDevice>;
}

pub struct PlaceholderBackend;

impl DeviceBackend for PlaceholderBackend {
    fn list_output_devices(&self) -> Vec<AudioDevice> {
        vec![AudioDevice {
            id: "default".into(),
            name: "System Default".into(),
            is_default: true,
            max_channels: 2,
        }]
    }

    fn list_input_devices(&self) -> Vec<AudioDevice> {
        vec![]
    }
}
