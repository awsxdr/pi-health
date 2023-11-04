import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

const TickContext = createContext<number>(0);

export const useTick = () => useContext(TickContext);

export const TickContextProvider = ({ children }: PropsWithChildren) => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(current => current + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [setTick]);

    return (
        <TickContext.Provider value={tick}>
            { children }
        </TickContext.Provider>
    );
}