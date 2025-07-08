use std::sync::Arc;

use industrial_device::types::Value;
use rocket::futures::lock::Mutex;

use industrial_device::errors::IndustrialDeviceError;
use industrial_device::IndustrialDevice;

use custom_error::custom_error;

custom_error! {PoisonedMutexError{err: String} = "Could not aquire lock ({err})"}

pub async fn send_command_write(
    device_m: &Arc<Mutex<impl IndustrialDevice>>, command: &str, value: &industrial_device::types::Value
) -> Result<(),IndustrialDeviceError>{
    let mut device = device_m.lock().await;
    device.connect().await?;
    device.write_register_by_name(command, value).await
}

pub async fn send_command_read(
    device_m: &Arc<Mutex<impl IndustrialDevice>>, command: &str) -> Result<Value,IndustrialDeviceError>{
    let mut device = device_m.lock().await;
    device.connect().await?;
    device.read_register_by_name(command).await
}
/*
pub async fn start_electrolyzer(
    device_m: Arc<Mutex<impl IndustrialDevice>>,
) -> Result<(), IndustrialDeviceError> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    device
        .write_register_by_name("Start/Stop", &Value::Boolean(true))
        .await
}

pub async fn stop_electrolyzer(
    device_m: Arc<Mutex<impl IndustrialDevice>>,
) -> Result<(), IndustrialDeviceError> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    device
        .write_register_by_name("Start/Stop", &Value::Boolean(false))
        .await
}
pub async fn set_rate(
    device_m: Arc<Mutex<impl IndustrialDevice>>,
    rate: f32,
) -> Result<(), IndustrialDeviceError> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    device
        .write_register_by_name("Production_rate", &Value::Float32(rate))
        .await
}
pub async fn restart_electrolyzer(
    device_m: Arc<Mutex<impl IndustrialDevice>>,
) -> Result<(), IndustrialDeviceError> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    device
        .write_register_by_name("Restart", &Value::Boolean(true))
        .await?;
    device
        .write_register_by_name("Restart", &Value::Boolean(false))
        .await
}
*/