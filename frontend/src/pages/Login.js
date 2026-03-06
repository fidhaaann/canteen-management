import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
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
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f8e6c1 0%, #f2bf7a 48%, #cd6145 100%)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -90,
          left: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 243, 209, 0.78), rgba(255, 243, 209, 0))',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: -90,
          bottom: -90,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(144, 54, 34, 0.32), rgba(144, 54, 34, 0))',
        }}
      />

      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          p: 2,
          zIndex: 1,
          borderRadius: 5,
          border: '2px solid rgba(255,255,255,0.45)',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(180deg, rgba(255, 251, 241, 0.97), rgba(255, 246, 226, 0.94))',
          boxShadow: '0 18px 45px rgba(74, 47, 34, 0.2)',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3.2 }}>
            <Restaurant sx={{ fontSize: 52, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 0.5, letterSpacing: '0.01em' }}>
              Retro Bites
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em' }}>
              CANTEEN MANAGEMENT SYSTEM
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              sx={{
                '& .MuiInputLabel-root': { color: '#6C5241' },
                '& .MuiOutlinedInput-input': { color: '#2F2218' },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiInputLabel-root': { color: '#6C5241' },
                '& .MuiOutlinedInput-input': { color: '#2F2218', WebkitTextFillColor: '#2F2218' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2.5, py: 1.5, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.2, textAlign: 'center', fontWeight: 700 }}>
            Admin: admin / admin123 &nbsp;|&nbsp; Staff: staff1 / staff123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
