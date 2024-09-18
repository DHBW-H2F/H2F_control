use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub controller_ip: String,
    pub controller_registers: String,
}
