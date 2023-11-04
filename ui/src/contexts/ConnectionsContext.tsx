import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCookie, setCookie } from "typescript-cookie";

export type Connection = {
    displayName: string,
    serverAddress: string,
    healthPort: number,
};

type ConnectionsContextProps = {
    connections: Connection[],
    addConnection: (connection: Connection) => void,
    removeConnection: (connection: Connection) => void,
};

export const DEFAULT_CONNECTION: Connection = {
    displayName: '',
    serverAddress: '',
    healthPort: 8002,
};

const DEFAULT_CONNECTIONS_CONTEXT_PROPS = {
    connections: [],
    addConnection: () => {},
    removeConnection: () => {},
};

const ConnectionsContext = createContext<ConnectionsContextProps>(DEFAULT_CONNECTIONS_CONTEXT_PROPS);

export const useConnections = () => useContext(ConnectionsContext);

export const ConnectionsContextProvider = ({ children }: PropsWithChildren) => {

    const [connections, setConnections] = useState<Connection[]>([]);

    useEffect(() => {
        const cookieValue = getCookie("health-connections");

        if(cookieValue) {
            const connections: Connection[] = JSON.parse(cookieValue);
            setConnections(connections);
        }
    }, [setConnections]);

    const updateConnections = useMemo(() => (connectionsFactory: (connections: Connection[]) => Connection[]) => {
        setConnections(current => {
            const newValue = connectionsFactory(current);
            setCookie("health-connections", JSON.stringify(newValue));
            return newValue;
        });
    }, [setConnections]);

    const addConnection = useMemo(() => (connection: Connection) => {
        updateConnections(current => 
            current
                .filter(c => c.displayName !== connection.displayName && c.serverAddress !== connection.serverAddress)
                .concat(connection));
    }, [setConnections]);

    const removeConnection = useMemo(() => (connection: Connection) => {
        updateConnections(current =>
            current
                .filter(c => c.displayName !== connection.displayName && c.serverAddress !== connection.serverAddress))
    }, [setConnections]);

    return (
        <ConnectionsContext.Provider value={{connections, addConnection, removeConnection}}>
            { children }
        </ConnectionsContext.Provider>
    );
}