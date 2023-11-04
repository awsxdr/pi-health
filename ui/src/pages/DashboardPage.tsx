import { useMemo, useState } from 'react';
import { AddServerDialog, ConnectionCard, ConnectionCardContainer, RemoveConnectionAlert, Toolbar } from '@components';
import { Connection, useConnections } from '@contexts/ConnectionsContext';

export const DashboardPage = () => {

    const { connections, addConnection, removeConnection } = useConnections();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isConfirmRemoveAlertOpen, setIsConfirmRemoveAlertOpen] = useState(false); 
    const [connectionBeingRemoved, setConnectionBeingRemoved] = useState<Connection | null>(null);

    const handleAddConnection = () => {
        setIsAddDialogOpen(true);
    }

    const handleConnectionAdded = useMemo(() => (connection: Connection) => {
        setIsAddDialogOpen(false);
        addConnection(connection);
    }, [setIsAddDialogOpen]);

    const handleCloseDialog = useMemo(() => () => {
        setIsAddDialogOpen(false);
    }, [setIsAddDialogOpen]);

    const handleRemoveConnection = useMemo(() => (connection: Connection) => {
        setConnectionBeingRemoved(connection);
        setIsConfirmRemoveAlertOpen(true);
    }, [setIsConfirmRemoveAlertOpen, setConnectionBeingRemoved]);

    const handleConfirmRemoveConnection = useMemo(() => () => {
        if(connectionBeingRemoved) {
            removeConnection(connectionBeingRemoved);
            setConnectionBeingRemoved(null);
        }
        setIsConfirmRemoveAlertOpen(false);
    }, [connectionBeingRemoved, removeConnection, setConnectionBeingRemoved, setIsConfirmRemoveAlertOpen]);

    const handleCancelRemoveConnection = useMemo(() => () => {
        setConnectionBeingRemoved(null);
        setIsConfirmRemoveAlertOpen(false);
    }, [setConnectionBeingRemoved, setIsConfirmRemoveAlertOpen])

    return (
        <>
            <Toolbar onAddServer={handleAddConnection} />
            <ConnectionCardContainer>
                {
                    connections.map(connection => (
                        <ConnectionCard 
                            title={connection.displayName} 
                            address={connection.serverAddress} 
                            healthPort={connection.healthPort} 
                            onRemove={() => handleRemoveConnection(connection)}
                        />
                    ))
                }
            </ConnectionCardContainer>
            <AddServerDialog isOpen={isAddDialogOpen} onAddServer={handleConnectionAdded} onClose={handleCloseDialog} />
            <RemoveConnectionAlert isOpen={isConfirmRemoveAlertOpen} onConfirm={handleConfirmRemoveConnection} onCancel={handleCancelRemoveConnection} />
        </>
    );
}