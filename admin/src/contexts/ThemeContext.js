import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                direction: 'rtl',
                palette: {
                    mode,
                    primary: {
                        main: '#1E3A8A',
                        light: '#3B82F6',
                        dark: '#1E3A8A',
                        contrastText: '#fff'
                    },
                    secondary: {
                        main: '#3B82F6'
                    },
                    error: {
                        main: '#EF4444'
                    },
                    warning: {
                        main: '#F59E0B'
                    },
                    info: {
                        main: '#3B82F6'
                    },
                    success: {
                        main: '#16A34A'
                    },
                    background: {
                        default: mode === 'light' ? '#F8F9FA' : '#0F1014',
                        paper: mode === 'light' ? '#FFFFFF' : '#16171D'
                    },
                    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                    text: {
                        primary: mode === 'light' ? '#111827' : '#F1F3F4',
                        secondary: mode === 'light' ? '#6B7280' : '#9AA0A6'
                    }
                },
                typography: {
                    fontFamily: '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontSize: '2.5rem', fontWeight: 700 },
                    h2: { fontSize: '2rem', fontWeight: 700 },
                    h3: { fontSize: '1.5rem', fontWeight: 600 },
                    h4: { fontSize: '1.25rem', fontWeight: 600 },
                    h5: { fontSize: '1.125rem', fontWeight: 600 },
                    h6: { fontSize: '1rem', fontWeight: 600 },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            containedPrimary: {
                                '&:hover': {
                                    backgroundColor: '#3B82F6',
                                },
                            },
                            containedSuccess: {
                                '&:hover': {
                                    backgroundColor: '#4ADE80',
                                },
                            },
                            containedWarning: {
                                '&:hover': {
                                    backgroundColor: '#D97706',
                                },
                            },
                            containedError: {
                                '&:hover': {
                                    backgroundColor: '#B91C1C',
                                },
                            }
                        }
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: '16px',
                                backgroundImage: 'none',
                                border: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.05)',
                                boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 8px 24px rgba(0, 0, 0, 0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    boxShadow: mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 12px 32px rgba(0, 0, 0, 0.4)',
                                }
                            }
                        }
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                borderRadius: '12px',
                                backgroundImage: 'none'
                            }
                        }
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#16171D',
                                color: mode === 'light' ? '#1E3A8A' : '#FFFFFF',
                                boxShadow: 'none',
                                borderBottom: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
                            }
                        }
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#16171D',
                                color: mode === 'light' ? '#1E3A8A' : '#FFFFFF',
                                border: 'none',
                                '& .MuiListItemIcon-root': {
                                    color: mode === 'light' ? '#1E3A8A' : 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiListItemText-primary': {
                                    color: mode === 'light' ? '#1E3A8A' : '#FFFFFF',
                                    fontWeight: 500,
                                },
                                '& .MuiListItemButton-root:hover': {
                                    backgroundColor: mode === 'light' ? 'rgba(30, 58, 138, 0.04)' : 'rgba(59, 130, 246, 0.2)',
                                },
                                '& .Mui-selected': {
                                    backgroundColor: mode === 'light' ? 'rgba(30, 58, 138, 0.08) !important' : 'rgba(59, 130, 246, 0.4) !important',
                                    '& .MuiListItemText-primary': {
                                        fontWeight: 700,
                                    }
                                }
                            }
                        }
                    },
                    MuiAlert: {
                        styleOverrides: {
                            filledSuccess: { backgroundColor: '#16A34A' },
                            filledError: { backgroundColor: '#EF4444' },
                            filledWarning: { backgroundColor: '#F59E0B' },
                            filledInfo: { backgroundColor: '#3B82F6' }
                        }
                    }
                }
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleColorMode }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};
