import { useMemo, PropsWithChildren, useState } from "react";
import { DEFAULT_HEALTH, Health, HealthGraph, HealthState } from ".";
import { Button, ButtonGroup, Card } from "@blueprintjs/core";
import styles from './ConnectionCard.module.scss';

export const ConnectionCardContainer = ({ children }: PropsWithChildren) => {
    return (
        <div className={styles.connectionCardContainer}>
            { children }
        </div>
    );
}

type ConnectionCardProps = {
    title?: string,
    address: string,
    healthPort: number,
    cacheSize: number,
    pollFrequencyInSeconds: number,

    onRemove?: () => void,
};

export const ConnectionCard = ({ title, address, healthPort, onRemove, ...graphProps }: ConnectionCardProps) => {

    const [health, setHealth] = useState<Health>(DEFAULT_HEALTH);

    const healthUri = useMemo(() => `http://${address}:${healthPort}/`, [address, healthPort]);

    const healthStyle = 
        health.overall === HealthState.Critical ? styles.danger
        : health.overall === HealthState.Unhealthy ? styles.warning
        : health.overall === HealthState.Unknown ? styles.unknown
        : styles.ok;

    return (
        <Card className={`${styles.connectionCard} ${healthStyle}`}>
            <ButtonGroup minimal className={styles.cardButtons}>
                <Button icon='cross' onClick={onRemove} />
            </ButtonGroup>
            <h4>
                {title || address}
            </h4>
            <HealthGraph healthUrl={healthUri} {...graphProps} onReceiveHealth={setHealth} />
        </Card>
    );
}