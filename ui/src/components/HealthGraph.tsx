import { useEffect, useMemo, useState } from "react";
import { useTick } from "../contexts";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const enum HealthState {
    Ok = 'Ok',
    Unhealthy = 'Unhealthy',
    Critical = 'Critical',
    Unknown = 'Unknown',
};

type HealthValue<TValue> = {
    state: HealthState;
    value: TValue;
    message: string;
};

type MemoryUsage = {
    total: number;
    used: number;
};

export type Health = {
    overall: HealthState;
    memory: HealthValue<MemoryUsage>;
    cpuTemperature: HealthValue<number>;
    cpuUsage: HealthValue<number>;
};

export const DEFAULT_MEMORY_STATE = {
    state: HealthState.Unknown,
    value: {
        total: 0,
        used: 0,
    },
    message: "",
};

export const DEFAULT_CPU_TEMP_STATE = {
    state: HealthState.Unknown,
    value: 0,
    message: "",
};

export const DEFAULT_CPU_USAGE_STATE = {
    state: HealthState.Unknown,
    value: 0,
    message: "",
};

export const DEFAULT_HEALTH: Health = {
    overall: HealthState.Unknown,
    memory: DEFAULT_MEMORY_STATE,
    cpuTemperature: DEFAULT_CPU_TEMP_STATE,
    cpuUsage: DEFAULT_CPU_USAGE_STATE,
};

type HealthGraphProps = {
    healthUrl: string,
    pollFrequencyInSeconds: number,
    cacheSize: number,
    onReceiveHealth?: (health: Health) => void,
};

export const HealthGraph = ({ healthUrl, cacheSize, pollFrequencyInSeconds, onReceiveHealth }: HealthGraphProps) => {
    const tick = useTick();
    const [health, setHealth] = useState<Health[]>(Array.apply(null, Array(cacheSize)).map(() => DEFAULT_HEALTH));
    const startTick = useMemo(() => tick, []);

    const addHealthState = useMemo(() => (health: Health) =>
        setHealth(current => {
            current.push(health);
            onReceiveHealth && onReceiveHealth(health);
            return current.slice(-cacheSize);
        }),
    [onReceiveHealth, setHealth]);

    useEffect(() => {
        if((startTick - tick) % pollFrequencyInSeconds === 0) {
            const abortController = new AbortController();
            const timeout = setTimeout(() => abortController.abort(), 900);
    
            fetch(healthUrl, { signal: abortController.signal }).then(response =>
                response.json().then(addHealthState)
            ).catch(() =>
                addHealthState({ ...DEFAULT_HEALTH, overall: HealthState.Critical })
            ).finally(() =>
                clearTimeout(timeout)
            );
        }
    }, [tick, startTick, addHealthState]);

    const normalizedData = useMemo(() => health.map((item, index) => ({
        index,
        memory: item.memory.value.used / item.memory.value.total * 100,
        memoryHealth: item.memory.state,
        cpuTemperature: item.cpuTemperature.value,
        cpuTemperatureHealth: item.cpuTemperature.state,
        cpuUsage: item.cpuUsage.value * 100,
        cpuUsageHealth: item.cpuUsage.state
    })), [health]);

    const formatTooltipEntry = (value: number, name: string) => {
        if(name === "Memory" || name === "CPU Usage") {
            return `${value.toFixed(2)}%`;
        } else if(name === "CPU Temp") {
            return `${value.toFixed(1)}°C`
        } else {
            return value.toString();
        }
    }

    return (
        <ResponsiveContainer width={500} aspect={1.5}>
            <LineChart data={normalizedData}>
                <Line type="monotone" dot={false} stroke='#0bb' strokeWidth={1} dataKey="memory" name="Memory" isAnimationActive={false} />
                <Line type="monotone" dot={false} stroke='#bb0' strokeWidth={1} dataKey="cpuTemperature" name="CPU Temp" isAnimationActive={false} />
                <Line type="monotone" dot={false} stroke='#b0b' strokeWidth={1} dataKey="cpuUsage" name="CPU Usage" isAnimationActive={false} />
                <XAxis domain={[0, cacheSize]} tick={false} />
                <YAxis domain={[0, 100]} />
                <Legend align="center" verticalAlign="top" height={36} />
                <Tooltip formatter={formatTooltipEntry} />
            </LineChart>
        </ResponsiveContainer>
    );
};