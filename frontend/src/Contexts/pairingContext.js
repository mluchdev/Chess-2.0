import React from 'react';
import { useLocation } from 'react-router-dom';

export const PairingContext = React.createContext();

export const PairingContextProvider = ({children}) => {
    const location = useLocation();
    const searches = React.useRef({}); // id -> { intervalID, deleteRecord }

    React.useEffect(() => {
        if(location.pathname !== '/') {
            Object.values(searches.current).forEach(({intervalID, deleteRecord}) => {
                clearInterval(intervalID);
                deleteRecord();
            });
            searches.current = {};
        }
    }, [location.pathname]);

    const startSearch = (id, intervalID, deleteRecord) => {
        searches.current[id] = {intervalID, deleteRecord};
    };

    const stopSearch = (id) => {
        const entry = searches.current[id];
        if(entry) {
            clearInterval(entry.intervalID);
            delete searches.current[id];
        }
    };

    const isSearching = (id) => !!searches.current[id];

    const value = {startSearch, stopSearch, isSearching};

    return <PairingContext.Provider value={value}>
        {children}
    </PairingContext.Provider>;
}

export const usePairingContext = () => React.useContext(PairingContext);
