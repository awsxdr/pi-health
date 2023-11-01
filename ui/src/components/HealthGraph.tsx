import { useEffect, useMemo, useState } from "react";
import { useTick } from "../contexts";
import { Line, LineChart, XAxis, YAxis } from "recharts";

enum HealthState {
    Ok,
    Unhealthy,
    Critical,
    Unknown,
};

interface HealthValue<TValue> {
    state: HealthState;
    value: TValue;
    message: string;
}

interface MemoryUsage {
    total: number;
    used: number;
}

interface Health {
    overall: HealthState;
    memory: HealthValue<MemoryUsage>;
    cpuTemperature: HealthValue<number>;
    cpuUsage: HealthValue<number>;
}

const DEFAULT_HEALTH: Health = {
    overall: HealthState.Unknown,
    memory: {
        state: HealthState.Unknown,
        value: {
            total: 0,
            used: 0,
        },
        message: "",
    },
    cpuTemperature: {
        state: HealthState.Unknown,
        value: 0,
        message: "",
    },
    cpuUsage: {
        state: HealthState.Unknown,
        value: 0,
        message: "",
    },
};

export const HealthGraph = () => {
    const tick = useTick();
    const [health, setHealth] = useState<Health[]>(Array.apply(null, Array(120)).map(() => DEFAULT_HEALTH));
    console.log(health);

    useEffect(() => {
        fetch('http://stats:8002').then(response => {
            response.json().then(health => setHealth(current => {
                current.push(health);
                return current.slice(-120);
            }));
        })
    }, [tick, setHealth]);

    const normalizedData = useMemo(() => health.map((item, index) => ({
        index,
        memory: item.memory.value.used / item.memory.value.total * 100,
        memoryHealth: item.memory.state,
        cpuTemperature: item.cpuTemperature.value,
        cpuTemperatureHealth: item.cpuTemperature.state,
        cpuUsage: item.cpuUsage.value * 100,
        cpuUsageHealth: item.cpuUsage.state
    })), [health]);

    return (
        <>
        test
            <LineChart data={normalizedData} width={800} height={600}>
                <Line type="monotone" dot={false} stroke='#0b2' strokeWidth={3} dataKey="memory" name="Memory" isAnimationActive={false} />
                <Line type="monotone" dot={false} stroke='#02b' strokeWidth={3} dataKey="cpuTemperature" name="CPU Temp" isAnimationActive={false} />
                <Line type="monotone" dot={false} stroke='#82b' strokeWidth={3} dataKey="cpuUsage" name="CPU Usage" isAnimationActive={false} />
                <XAxis domain={[0, 120]} tick={false} />
                <YAxis domain={[0, 100]} />
            </LineChart>
        </>
    );
};