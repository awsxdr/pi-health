use log::{error, debug};
use serde::{Serialize, Deserialize};
use tokio::sync::{Mutex, RwLock};
use std::{time::SystemTime, sync::Arc};
use systemstat::{System, Platform};

#[derive(Serialize, Deserialize, Clone, PartialEq, Default)]
pub enum HealthState {
    Ok,
    Unhealthy,
    Critical,
    #[default] Unknown,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct HealthValue<TValue: Clone + std::default::Default> {
    pub state: HealthState,
    pub value: TValue,
    pub message: String,
}

impl<TValue: Clone + std::default::Default> HealthValue<TValue> {
    pub fn critical(message: String) -> Self {
        HealthValue {
            state: HealthState::Critical,
            value: TValue::default(),
            message,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct MemoryUsage {
    pub total: u64,
    pub used: u64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Health {
    pub overall: HealthState,
    pub memory: HealthValue<MemoryUsage>,
    #[serde(rename = "cpuTemperature")] pub cpu_temperature: HealthValue<f32>,
    #[serde(rename = "cpuUsage")]pub cpu_usage: HealthValue<f32>,
}

impl Health {
    pub fn critical() -> Health {
        Health {
            overall: HealthState::Critical,
            memory: HealthValue::default(),
            cpu_temperature: HealthValue::default(),
            cpu_usage: HealthValue::default()
        }
    }

    pub fn from_states(
        memory: HealthValue<MemoryUsage>,
        cpu_temperature: HealthValue<f32>,
        cpu_usage: HealthValue<f32>
    ) -> Health {
        let health_states = [&memory.state, &cpu_temperature.state, &cpu_usage.state];

        let lowest_health =
            if health_states.contains(&&HealthState::Critical) { HealthState::Critical }
            else if health_states.contains(&&HealthState::Unhealthy) { HealthState::Unhealthy }
            else if health_states.contains(&&HealthState::Unknown) { HealthState::Unknown }
            else { HealthState::Ok };

        Health {
            overall: lowest_health,
            memory,
            cpu_temperature,
            cpu_usage,
        }
    }
}

pub struct HealthCheck {
    last_update_time: SystemTime,
    last_health: Health,
    system_info: Arc<Mutex<System>>,
    average_cpu_load: Arc<RwLock<HealthValue<f32>>>,
}

impl HealthCheck {
    pub fn new(system_info: System) -> HealthCheck {
        let system_info = Arc::new(Mutex::new(system_info));
        let cloned_system_info = system_info.clone();

        let average_cpu_load = Arc::new(RwLock::new(HealthValue::default()));
        let cloned_average_cpu_load = average_cpu_load.clone();
        
        tokio::task::spawn(async move {
            debug!("Starting CPU monitoring thread");

            Self::cpu_monitor_thread(cloned_system_info, cloned_average_cpu_load).await;
        });

        HealthCheck {
            last_update_time: std::time::UNIX_EPOCH,
            last_health: Health::default(),
            system_info: system_info,
            average_cpu_load,
        }
    }

    pub async fn get_current_health(&mut self) -> Health {
        let time_since_last_update =
            match self.last_update_time.elapsed() {
                Ok(t) => t,
                _ => return Health::critical()
            };

        if time_since_last_update.as_millis() < 1000 {
            return self.last_health.clone();
        }

        self.last_update_time = SystemTime::now();

        let health = self.get_health_state().await;
        self.last_health = health.clone();

        health
    }

    async fn cpu_monitor_thread(system_info: Arc<Mutex<System>>, cpu_load_store: Arc<RwLock<HealthValue<f32>>>) {
        loop {
            let load_aggregate = system_info.lock().await.cpu_load_aggregate();
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

            let health = match load_aggregate.and_then(|v| v.done()).map(|v| 1.0 - v.idle) {
                Ok(load) => {
                    HealthValue {
                        state: 
                            if load > 0.999 {
                                HealthState::Critical
                            } else if load > 0.7 {
                                HealthState::Unhealthy
                            } else {
                                HealthState::Ok
                            },
                        value: load,
                        message: String::default()
                    }
                }
                Err(e) => {
                    error!("Error retrieving CPU usage: {:?}", e);
    
                    HealthValue::critical(e.to_string())
                }
            };
            debug!("Retrieved CPU usage as {}", health.value);

            cpu_load_store.write().await.clone_from(&health);
        }
    }

    async fn get_health_state(&self) -> Health {
        Health::from_states(
            self.get_memory_state().await,
            self.get_cpu_temperature_state().await,
            self.get_cpu_usage_state().await,
        )
    }
    
    async fn get_memory_state(&self) -> HealthValue<MemoryUsage> {
        match self.system_info.lock().await.memory() {
            Ok(memory) => {
                HealthValue {
                    state: if memory.free.as_u64() < 256 * 1024 * 1024 { 
                            HealthState::Critical
                        } else if memory.free.as_u64() < 512 * 1024 * 1024 {
                            HealthState::Unhealthy
                        } else {
                            HealthState::Ok
                        },
                    value: MemoryUsage { total: memory.total.as_u64(), used: memory.total.as_u64() - memory.free.as_u64() },
                    message: String::default(),
                }
            }
            Err(e) => {
                error!("Error retrieving memory state: {:?}", e);
    
                HealthValue::critical(e.to_string())
            }
        }
    }
    
    async fn get_cpu_temperature_state(&self) -> HealthValue<f32> {
        match self.system_info.lock().await.cpu_temp() {
            Ok(cpu_temp) => {
                HealthValue {
                    state: if cpu_temp > 90.0 {
                            HealthState::Critical
                        } else if cpu_temp > 70.0 {
                            HealthState::Unhealthy
                        } else {
                            HealthState::Ok
                        },
                    value: cpu_temp,
                    message: String::default(),
                }
            }
            Err(e) => {
                error!("Error retrieving CPU temperature: {:?}", e);
    
                HealthValue::critical(e.to_string())
            }
        }
    }

    async fn get_cpu_usage_state(&self) -> HealthValue<f32> {
        self.average_cpu_load.read().await.clone()
    }
}