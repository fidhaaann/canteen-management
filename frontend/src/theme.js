import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2E7D32',
        light: '#4CAF50',
        dark: '#1B5E20',
      },
      secondary: {
        main: '#FF6F00',
        light: '#FFA726',
        dark: '#E65100',
      },
      background: {
        default: mode === 'light' ? '#F5F5F5' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
    },
    typography: {
      fontFamily: "'Poppins', 'Inter', 'Roboto', sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light'
              ? '0 2px 12px rgba(0,0,0,0.08)'
              : '0 2px 12px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
          },
        },
      },
    },
  });
