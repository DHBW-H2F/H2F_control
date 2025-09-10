
use std::sync::Arc;

use industrial_device::types::Value;
use rocket::futures::lock::Mutex;

use industrial_device::errors::IndustrialDeviceError;
use industrial_device::IndustrialDevice;

use custom_error::custom_error;

custom_error! {PoisonedMutexError{err: String} = "Could not aquire lock ({err})"}

/// Sends a command to an industrial device that writes a value to a register.
/// 
/// @param {&Arc<Mutex<impl IndustrialDevice>>} device_m - reference to an
/// `Arc<Mutex<impl IndustrialDevice>>`which correspond to the device we want to send the command
/// 
/// @param {&str} command - a string that represents the command name describe in the file `register.json`
/// 
/// @param {&industrial_device::types::Value} value - The value we want to write in the register.
/// 
/// @returns returns the result of the command (if it has been sent correctly)
pub async fn send_command_write(
    device_m: &Arc<Mutex<impl IndustrialDevice>>, command: &str, value: &industrial_device::types::Value
) -> Result<(),IndustrialDeviceError>{
    let mut device = device_m.lock().await;
    device.connect().await?;
    device.write_register_by_name(command, value).await
}

/// This Rust function sends a command to an industrial device to read a register, and returns the result value.
/// 
/// @param {&Arc<Mutex<impl IndustrialDevice>>} device_m - reference to an
/// `Arc<Mutex<impl IndustrialDevice>>`which correspond to the device we want to send the command
/// 
/// @param {&str} command - a string that represents the command name describe in the file `register.json`
/// 
/// @returns a `Result` containing either a `Value` or an `IndustrialDeviceError`.
pub async fn send_command_read(
    device_m: &Arc<Mutex<impl IndustrialDevice>>, command: &str) -> Result<Value,IndustrialDeviceError>{
    let mut device = device_m.lock().await;
    device.connect().await?;
    device.read_register_by_name(command).await
}