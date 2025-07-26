'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0066CC', // Compare the Market's primary blue
            light: '#4D94FF', // Lighter blue for hover states
            dark: '#004999', // Darker blue for active states
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#64748B', // Modern slate gray
            light: '#94A3B8',
            dark: '#475569',
            contrastText: '#ffffff',
        },
        error: {
            main: '#DC2626', // Red for errors
            light: '#F87171',
            dark: '#B91C1C',
        },
        warning: {
            main: '#D97706', // Orange for warnings
            light: '#FBBF24',
            dark: '#B45309',
        },
        info: {
            main: '#0284C7', // Info blue (slightly different from primary)
            light: '#38BDF8',
            dark: '#0369A1',
        },
        success: {
            main: '#059669', // Green only for success states
            light: '#34D399',
            dark: '#047857',
        },
        background: {
            default: '#FAFAFA', // Very light grey background like CTM
            paper: '#FFFFFF',
        },
        grey: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E0',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
        },
        text: {
            primary: '#0F172A', // Dark slate for primary text
            secondary: '#475569', // Medium slate for secondary text
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            color: '#0F172A',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.3,
            letterSpacing: '-0.025em',
            color: '#0F172A',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
            letterSpacing: '-0.025em',
            color: '#0F172A',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
            color: '#0F172A',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            fontWeight: 400,
            color: '#334155',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            fontWeight: 400,
            color: '#475569',
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.025em',
        },
    },
    shape: {
        borderRadius: 8,
    },
});

const themeWithComponents = createTheme(theme, {
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0, 102, 204, 0.15)',
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                outlinedPrimary: {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: '#EBF4FF', // Very light blue
                        borderColor: theme.palette.primary.main,
                    },
                },
                containedSecondary: {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    '&:hover': {
                        backgroundColor: theme.palette.secondary.dark,
                    },
                },
                textPrimary: {
                    color: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: '#EBF4FF',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: theme.palette.background.paper,
                        transition: 'all 0.2s ease-in-out',
                        '& fieldset': {
                            borderColor: theme.palette.grey[300],
                        },
                        '&:hover fieldset': {
                            borderColor: theme.palette.grey[400],
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px',
                            boxShadow: `0 0 0 3px rgba(0, 102, 204, 0.1)`,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: theme.palette.grey[600],
                        fontWeight: 500,
                        '&.Mui-focused': {
                            color: theme.palette.primary.main,
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    backgroundColor: theme.palette.background.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.grey[300],
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.grey[400],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px',
                        boxShadow: `0 0 0 3px rgba(0, 102, 204, 0.1)`,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.grey[200]}`,
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-2px)',
                        borderColor: theme.palette.grey[300],
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: theme.palette.grey[400],
                    '&.Mui-checked': {
                        color: theme.palette.primary.main,
                    },
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: theme.palette.grey[400],
                    '&.Mui-checked': {
                        color: theme.palette.primary.main,
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: theme.palette.primary.main,
                        '& + .MuiSwitch-track': {
                            backgroundColor: theme.palette.primary.main,
                        },
                    },
                },
            },
        },
    },
});

interface CustomThemeProviderProps {
    children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
    children,
}) => {
    return (
        <ThemeProvider theme={themeWithComponents}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};
