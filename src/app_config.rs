use serde::Deserialize;
use s7_device::S7Device;
use rocket::futures::lock::Mutex;
use std::sync::Arc;
#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub logo_ip: String,
    pub logo_registers: String,

    //  pub electrolyser_ip: String,
    //  pub electrolyser_input_registers: String,
    //  pub electrolyser_holding_registers: String,
    
    //  pub compressor_ip: String,
    //  pub compressor_registers: String,
}