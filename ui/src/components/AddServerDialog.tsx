import { useState } from 'react';
import { Button, ControlGroup, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Label, NumericInput } from '@blueprintjs/core';
import { Connection, DEFAULT_CONNECTION } from '@contexts';
import styles from './AddServerDialog.module.css';

type AddServerDialogProps = {
    isOpen: boolean,
    onAddServer?: (connection: Connection) => void,
    onClose?: () => void,
}

export const AddServerDialog = ({ isOpen, onAddServer, onClose }: AddServerDialogProps) => {

    const [name, setName] = useState(DEFAULT_CONNECTION.displayName);
    const [serverAddress, setServerAddress] = useState(DEFAULT_CONNECTION.serverAddress);
    const [healthPort, setHealthPort] = useState(DEFAULT_CONNECTION.healthPort);
    const [pollFrequency, setPollFrequency] = useState(DEFAULT_CONNECTION.pollFrequencyInSeconds);
    const [cacheSize, setCacheSize] = useState(DEFAULT_CONNECTION.cacheSize);

    const resetValues = () => {
        setName(DEFAULT_CONNECTION.displayName);
        setServerAddress(DEFAULT_CONNECTION.serverAddress);
        setHealthPort(DEFAULT_CONNECTION.healthPort);
    }

    const handleCancel = () => {
        resetValues();
        onClose && onClose();
    };

    const handleAdd = () => {
        const connection = {
            displayName: name,
            serverAddress,
            healthPort,
            pollFrequencyInSeconds: pollFrequency,
            cacheSize,
        };

        resetValues();
        onAddServer && onAddServer(connection);
    }

    const Actions = () => (
        <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleAdd} intent='primary' icon='plus'>Add connection</Button>
        </>
    );

    return (
        <Dialog title="Add connection" isOpen={isOpen} onClose={handleCancel}>
            <DialogBody>
                <FormGroup
                    helperText='The name to show on the dashboard'
                    label='Display name'
                    labelFor='display-name'
                    labelInfo='*'
                >
                    <InputGroup id='display-name' value={name} onValueChange={setName} required />
                </FormGroup>
                <FormGroup
                    label='Server address'
                    labelFor='server-address'
                    labelInfo='*'
                >
                    <InputGroup id='server-address' value={serverAddress} onValueChange={setServerAddress} required />
                </FormGroup>
                <FormGroup
                    label='Health port'
                    helperText='The port that the pi-health server is running on'
                    labelFor='health-port'
                    labelInfo='*'
                >
                    <NumericInput id='health-port' value={healthPort} onValueChange={setHealthPort} min={1} max={65535} required />
                </FormGroup>
                <ControlGroup>
                    <FormGroup
                        label='Poll frequency'
                        labelFor='poll-frequency'
                        labelInfo='*'
                    >
                        <NumericInput id='poll-frequency' value={pollFrequency} onValueChange={setPollFrequency} min={1} max={3600} required />
                    </FormGroup>
                    <span className={styles.inputPostText}>seconds</span>
                </ControlGroup>
                <FormGroup
                    label='Cached items'
                    helperText='The number of previous statuses to display'
                    labelFor='cache-size'
                    labelInfo='*'
                >
                    <NumericInput id='cache-size' value={cacheSize} onValueChange={setCacheSize} min={1} max={1000} required />
                </FormGroup>
            </DialogBody>
            <DialogFooter actions={<Actions />} />
        </Dialog>
    )
}