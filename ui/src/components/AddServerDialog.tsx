import { useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, NumericInput } from '@blueprintjs/core';
import { Connection, DEFAULT_CONNECTION } from '@contexts';

type AddServerDialogProps = {
    isOpen: boolean,
    onAddServer?: (connection: Connection) => void,
    onClose?: () => void,
}

export const AddServerDialog = ({ isOpen, onAddServer, onClose }: AddServerDialogProps) => {

    const [name, setName] = useState(DEFAULT_CONNECTION.displayName);
    const [serverAddress, setServerAddress] = useState(DEFAULT_CONNECTION.serverAddress);
    const [healthPort, setHealthPort] = useState(DEFAULT_CONNECTION.healthPort);

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
                    <InputGroup id='display-name' value={name} onValueChange={setName} />
                </FormGroup>
                <FormGroup
                    label='Server address'
                    labelFor='server-address'
                    labelInfo='*'
                >
                    <InputGroup id='server-address' value={serverAddress} onValueChange={setServerAddress} />
                </FormGroup>
                <FormGroup
                    label='Health port'
                    helperText='The port that the pi-health server is running on'
                    labelFor='health-port'
                    labelInfo='*'
                >
                    <NumericInput value={healthPort} onValueChange={setHealthPort} min={1} max={65535} />
                </FormGroup>
            </DialogBody>
            <DialogFooter actions={<Actions />} />
        </Dialog>
    )
}