use std::sync::Arc;

use rocket::futures::lock::Mutex;
use s7_device::errors::RegisterDoesNotExistsError;
use s7_device::errors::S7Error;
use s7_device::types::RegisterValue;
use s7_device::S7Connexion;
use s7_device::S7Device;

extern crate custom_error;
use custom_error::custom_error;

custom_error! {PoisonedMutexError{err: String} = "Could not aquire lock ({err})"}

pub async fn start_electrolyzer(device_m: Arc<Mutex<S7Device>>) -> Result<String, S7Error> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    let start_register = &device
        .get_register_by_name("Start/Stop".to_string())
        .ok_or(RegisterDoesNotExistsError)?
        .clone();

    match device
        .write_register(start_register.clone(), RegisterValue::Boolean(true))
        .await
    {
        Ok(_) => Ok("".to_string()),
        Err(_) => Err(S7Error::RegisterDoesNotExistsError(RegisterDoesNotExistsError).into()),
    }
}
pub async fn stop_electrolyzer(device_m: Arc<Mutex<S7Device>>) -> Result<String, S7Error> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    let stop_register = &device
        .get_register_by_name("Start/Stop".to_string())
        .ok_or(RegisterDoesNotExistsError)?
        .clone();

    let res = device
        .write_register(
            stop_register.clone(),
            s7_device::types::RegisterValue::Boolean(false),
        )
        .await;

    match res {
        Ok(_) => Ok("".to_string()),
        Err(_) => Err(RegisterDoesNotExistsError.into()),
    }
}
pub async fn set_rate(device_m: Arc<Mutex<S7Device>>, rate: f32) -> Result<String, S7Error> {
    let mut device = device_m.lock().await;
    device.connect().await?;

    let rate_register = &device
        .get_register_by_name("Production_rate".to_string())
        .ok_or(RegisterDoesNotExistsError)?
        .clone();

    let res = device
        .write_register(
            rate_register.clone(),
            s7_device::types::RegisterValue::Float32(rate),
        )
        .await;

    match res {
        Ok(_) => Ok("".to_string()),
        Err(_) => Err(RegisterDoesNotExistsError.into()),
    }
}
