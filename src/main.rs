use log::{LevelFilter, error};
use serde::{Serialize, Deserialize};
use serde_json::json;
use simplelog::{CombinedLogger, TermLogger, Config, TerminalMode, ColorChoice};
use systemstat::{System, Platform};

#[derive(Serialize, Deserialize)]
enum HealthState {
    Ok,
    Unhealthy,
    Critical,
    Unknown,
}

#[derive(Serialize, Deserialize)]
struct HealthValue<TValue> {
    pub state: HealthState,
    pub value: TValue,
}

#[derive(Serialize, Deserialize)]
struct MemoryUsage {
    pub total: u64,
    pub used: u64,
}

#[derive(Serialize, Deserialize)]
struct Health {
    pub memory: HealthValue<MemoryUsage>,
    pub cpu_temperature: HealthValue<f32>,
}

#[tokio::main]
async fn main() {
    CombinedLogger::init(
        vec![
            TermLogger::new(LevelFilter::Debug, Config::default(), TerminalMode::Mixed, ColorChoice::Auto),
        ]
    ).unwrap();

    let health = get_health_state();

    println!("{}", json!(health).to_string());
}

fn get_health_state() -> Health {
    let system_info = System::new();

    Health {
        memory: get_memory_state(&system_info),
        cpu_temperature: get_cpu_temperature_state(&system_info),
    }
}

fn get_memory_state(system_info: &System) -> HealthValue<MemoryUsage> {
    match system_info.memory() {
        Ok(memory) => {
            HealthValue {
                state: if memory.free.as_u64() < 10 * 1024 * 1024 { 
                        HealthState::Critical
                    } else if memory.free.as_u64() < 100 * 1024 * 1024 {
                        HealthState::Unhealthy
                    } else {
                        HealthState::Ok
                    },
                value: MemoryUsage { total: memory.total.as_u64(), used: memory.total.as_u64() - memory.free.as_u64() }
            }
        }
        Err(e) => {
            error!("Error retrieving memory state: {:?}", e);

            HealthValue {
                state: HealthState::Unknown,
                value: MemoryUsage { total: 0, used: 0 },
            }
        }
    }
}

fn get_cpu_temperature_state(system_info: &System) -> HealthValue<f32> {
    match system_info.cpu_temp() {
        Ok(cpu_temp) => {
            HealthValue {
                state: if cpu_temp > 95.0 {
                        HealthState::Critical
                    } else if cpu_temp > 80.0 {
                        HealthState::Unhealthy
                    } else {
                        HealthState::Ok
                    },
                value: cpu_temp
            }
        }
        Err(e) => {
            error!("Error retrieving CPU temperature: {:?}", e);

            HealthValue {
                state: HealthState::Unknown,
                value: 0.0
            }
        }
    }
}