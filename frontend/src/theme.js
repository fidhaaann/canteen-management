import { alpha, createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#C64B33',
        light: '#EA7A58',
        dark: '#98341F',
      },
      secondary: {
        main: '#F2A53D',
        light: '#FFD275',
        dark: '#B9761E',
      },
      success: {
        main: '#3B7A57',
      },
      background: {
        default: mode === 'light' ? '#FFF4DF' : '#1D1711',
        paper: mode === 'light' ? '#FFFDF5' : '#2C241D',
      },
      text: {
        primary: mode === 'light' ? '#34261B' : '#F6E9D8',
        secondary: mode === 'light' ? '#6C5241' : '#C9B29C',
      },
    },
    typography: {
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      h4: {
        fontFamily: "'Bungee', 'Nunito', sans-serif",
        fontWeight: 400,
        letterSpacing: '0.02em',
      },
      h5: {
        fontFamily: "'Bungee', 'Nunito', sans-serif",
        fontWeight: 400,
      },
      h6: {
        fontFamily: "'Bungee', 'Nunito', sans-serif",
        fontWeight: 400,
      },
      button: {
        fontWeight: 800,
        letterSpacing: '0.03em',
      },
    },
    shape: {
      borderRadius: 18,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#FFF4DF' : '#1D1711',
            backgroundImage: mode === 'light'
              ? 'radial-gradient(circle at 12% 15%, rgba(255,205,133,0.30), transparent 36%), radial-gradient(circle at 88% 10%, rgba(198,75,51,0.2), transparent 38%), radial-gradient(circle at 50% 100%, rgba(242,165,61,0.18), transparent 45%)'
              : 'radial-gradient(circle at 12% 15%, rgba(242,165,61,0.10), transparent 36%), radial-gradient(circle at 88% 10%, rgba(198,75,51,0.18), transparent 38%), radial-gradient(circle at 50% 100%, rgba(255,221,183,0.08), transparent 45%)',
            backgroundAttachment: 'fixed',
          },
          '#root': {
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 14,
            paddingInline: 18,
            transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
            boxShadow: `0 8px 18px ${alpha('#9B3A27', mode === 'light' ? 0.22 : 0.35)}`,
            '&:hover': {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: `0 12px 24px ${alpha('#9B3A27', mode === 'light' ? 0.27 : 0.42)}`,
              filter: 'saturate(1.08)',
            },
            '&:active': {
              transform: 'translateY(1px) scale(0.98)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #C64B33 0%, #EA7A58 100%)',
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'transform 160ms ease, background-color 160ms ease',
            '&:hover': {
              transform: 'rotate(-6deg) scale(1.07)',
              backgroundColor: alpha('#F2A53D', mode === 'light' ? 0.22 : 0.25),
            },
            '&:active': {
              transform: 'scale(0.94)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `2px solid ${alpha(mode === 'light' ? '#F2A53D' : '#FFD275', 0.35)}`,
            boxShadow: mode === 'light'
              ? '0 10px 30px rgba(120, 72, 34, 0.12)'
              : '0 12px 30px rgba(0, 0, 0, 0.34)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `2px solid ${alpha(mode === 'light' ? '#F2A53D' : '#FFD275', 0.30)}`,
            backgroundImage: mode === 'light'
              ? 'linear-gradient(180deg, rgba(255,253,245,0.95), rgba(255,247,227,0.95))'
              : 'linear-gradient(180deg, rgba(52,42,34,0.95), rgba(38,31,25,0.95))',
            transition: 'transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              borderColor: alpha('#EA7A58', 0.7),
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundImage: mode === 'light'
              ? 'linear-gradient(135deg, rgba(255,253,245,0.88), rgba(255,242,212,0.85))'
              : 'linear-gradient(135deg, rgba(40,32,26,0.90), rgba(56,45,36,0.86))',
            borderBottom: `2px solid ${alpha(mode === 'light' ? '#EA7A58' : '#F2A53D', 0.35)}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: mode === 'light'
              ? 'linear-gradient(180deg, rgba(255,249,233,0.98), rgba(255,237,202,0.98))'
              : 'linear-gradient(180deg, rgba(48,39,32,0.98), rgba(35,29,24,0.98))',
            borderRight: `2px dashed ${alpha(mode === 'light' ? '#C64B33' : '#FFD275', 0.45)}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            marginBottom: 4,
            transition: 'transform 160ms ease, background-color 160ms ease',
            '&:hover': {
              transform: 'translateX(6px)',
              backgroundColor: alpha('#F2A53D', mode === 'light' ? 0.22 : 0.18),
            },
            '&.Mui-selected': {
              background: 'linear-gradient(90deg, rgba(198,75,51,0.92), rgba(234,122,88,0.92))',
              color: '#fff',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            letterSpacing: '0.04em',
            borderRadius: 999,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#6C5241' : '#D9C4AF',
            fontWeight: 700,
            '&.Mui-focused': {
              color: mode === 'light' ? '#B9442C' : '#FFD275',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 251, 241, 0.9)' : 'rgba(45, 36, 29, 0.78)',
            borderRadius: 14,
            transition: 'box-shadow 180ms ease, border-color 180ms ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(mode === 'light' ? '#B57D2F' : '#F2A53D', 0.55),
              borderWidth: 2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(mode === 'light' ? '#C64B33' : '#FFD275', 0.72),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#B9442C' : '#FFD275',
              boxShadow: `0 0 0 4px ${alpha(mode === 'light' ? '#EA7A58' : '#F2A53D', 0.2)}`,
            },
            '& .MuiOutlinedInput-input': {
              color: mode === 'light' ? '#2F2218' : '#F7ECDD',
              fontWeight: 700,
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: alpha(mode === 'light' ? '#6C5241' : '#D9C4AF', 0.85),
              opacity: 1,
            },
            '& .MuiOutlinedInput-input:-webkit-autofill': {
              WebkitTextFillColor: mode === 'light' ? '#2F2218' : '#F7ECDD',
              WebkitBoxShadow: `0 0 0 100px ${mode === 'light' ? '#FFF9EE' : '#2D241D'} inset`,
              transition: 'background-color 9999s ease-in-out 0s',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.72rem',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          thumb: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          },
          switchBase: {
            transitionDuration: '220ms',
          },
          track: {
            opacity: 1,
            borderRadius: 999,
          },
        },
      },
    },
  });
