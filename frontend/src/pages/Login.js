import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ─── Hardcoded field styles — always dark card, light text ─── */
const labelSx = { color: '#C9B29C', fontWeight: 600, fontSize: '0.78rem' };
const inputSx = {
  color: '#F7ECDD',
  WebkitTextFillColor: '#F7ECDD',
  fontSize: '0.9rem',
};
const fieldSx = {
  mt: 0,
  '& .MuiInputLabel-root': labelSx,
  '& .MuiInputLabel-root.Mui-focused': { color: '#FFD275' },
  '& .MuiOutlinedInput-input': inputSx,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '8px',
    '& fieldset': { borderColor: 'rgba(255,215,157,0.30)', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: 'rgba(255,215,157,0.55)' },
    '&.Mui-focused fieldset': { borderColor: '#F2A53D', borderWidth: '2px' },
  },
  '& .MuiSvgIcon-root': { color: '#C9B29C' },
  // autofill override
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px #2C1F18 inset',
    WebkitTextFillColor: '#F7ECDD',
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password, role });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        /* Lightened dark background */
        background: 'linear-gradient(145deg, #1a1410 0%, #2d2319 45%, #3d2e1f 100%)',
        p: { xs: 2, md: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cursor light orb effect */}
      <Box
        sx={{
          position: 'fixed',
          top: cursorPos.y,
          left: cursorPos.x,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242,165,61,0.4) 0%, rgba(242,165,61,0.1) 50%, transparent 100%)',
          boxShadow: '0 0 40px rgba(242,165,61,0.3), 0 0 80px rgba(242,165,61,0.15)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          transition: 'all 0.1s ease-out',
        }}
      />

      {/* Subtle ambient glows */}
      <Box sx={{ position: 'absolute', top: -120, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(198,75,51,0.18), transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,165,61,0.14), transparent 70%)', pointerEvents: 'none' }} />

      <Card
        sx={{
          maxWidth: 380,
          width: '100%',
          zIndex: 1,
          borderRadius: '16px',
          border: '1.5px solid rgba(255,215,157,0.18)',
          background: 'linear-gradient(160deg, #241610 0%, #1a0f09 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,200,100,0.06)',
          backdropFilter: 'blur(12px)',
          // override MUI Card default backgroundImage
          backgroundImage: 'none !important',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>

          {/* ── Logo & Title ── */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 54, height: 54, borderRadius: '14px',
              background: 'linear-gradient(135deg, #C64B33, #EA7A58)',
              boxShadow: '0 8px 20px rgba(198,75,51,0.40)',
              mb: 1.5,
            }}>
              <Restaurant sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography sx={{ color: '#FFD275', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              Retro Bites
            </Typography>
            <Typography sx={{ color: '#8C7060', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', mt: 0.5 }}>
              CANTEEN MANAGEMENT SYSTEM
            </Typography>
          </Box>

          {/* ── Error Alert ── */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: '8px', bgcolor: 'rgba(198,75,51,0.15)', color: '#FF9080', border: '1px solid rgba(198,75,51,0.35)', '& .MuiAlert-icon': { color: '#FF9080' } }}
            >
              {error}
            </Alert>
          )}

          {/* ── Form ── */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Role selector */}
            <Box>
              <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>Select Role</Typography>
              <TextField
                select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ ...fieldSx, mt: 0 }}
                SelectProps={{ native: true }}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </TextField>
            </Box>

            {/* Username / Register Number */}
            <Box>
              <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>
                {role === 'student' ? 'Register Number' : 'Username'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                placeholder={role === 'student' ? 'e.g. REG2024001' : 'Enter username'}
                sx={fieldSx}
                InputLabelProps={{ shrink: false }}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>Password</Typography>
              <TextField
                type={showPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#8C7060', '&:hover': { color: '#F2A53D', bgcolor: 'transparent' } }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                background: 'linear-gradient(135deg, #C64B33 0%, #EA7A58 100%)',
                color: '#fff',
                borderRadius: '10px',
                boxShadow: '0 6px 20px rgba(198,75,51,0.40)',
                '&:hover': { background: 'linear-gradient(135deg, #D45A40 0%, #F08060 100%)', boxShadow: '0 8px 24px rgba(198,75,51,0.55)' },
                '&.Mui-disabled': { background: 'rgba(198,75,51,0.3)', color: 'rgba(255,255,255,0.4)' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>

          </Box>

          {/* ── Create Account link (no wrapper background) ── */}
          {role === 'student' && (
            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Typography component="span" sx={{ color: '#8C7060', fontSize: '0.82rem' }}>
                New student?{' '}
              </Typography>
              <Typography
                component="span"
                onClick={() => navigate('/register')}
                sx={{
                  color: '#F2A53D',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline', color: '#FFD275' },
                }}
              >
                Create Account
              </Typography>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}
