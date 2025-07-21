import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    error: {
      main: '#ef4444',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Form components
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              '& fieldset': {
                borderColor: '#9ca3af',
              },
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              '& fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
              },
            },
            '&.Mui-error': {
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 500,
            color: '#374151',
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
        },
      },
    },
    
    MuiFormControl: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },

    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f3f4f6',
          },
          '&.Mui-selected': {
            backgroundColor: '#dbeafe',
            '&:hover': {
              backgroundColor: '#bfdbfe',
            },
          },
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
          '& .MuiSlider-thumb': {
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.4)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#3b82f6',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#e5e7eb',
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#3b82f6',
          },
        },
      },
    },

    // Layout components
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          '&.form-card': {
            marginBottom: '1.5rem',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          '&.MuiAlert-standardError': {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            '& .MuiAlert-icon': {
              color: '#dc2626',
            },
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '0.875rem',
        },
        outlined: {
          '&.back-button': {
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb',
            },
          },
        },
        contained: {
          '&.primary-button': {
            backgroundColor: '#3b82f6',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
            },
          },
          '&.submit-button': {
            backgroundColor: '#3b82f6',
            fontSize: '1rem',
            padding: '12px 48px',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
    },

    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiStepIcon-root': {
            fontSize: '1.5rem',
          },
        },
      },
    },
  },
});