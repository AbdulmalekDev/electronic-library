import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [progress, setProgress] = useState(0);
    const [hideLayout, setHideLayout] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const updateProgress = useCallback((val) => {
        setProgress(val);
    }, []);

    const values = useMemo(() => ({
        isSidebarOpen,
        toggleSidebar,
        progress,
        setProgress: updateProgress,
        hideLayout,
        setHideLayout
    }), [isSidebarOpen, toggleSidebar, progress, updateProgress, hideLayout]);

    return (
        <LayoutContext.Provider value={values}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
