import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import api from '../api';

export default function StudentRegister() {
  const [registerNumber, setRegisterNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/student-register', { register_number: registerNumber, fullName, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
            <School sx={{ fontSize: 52, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 0.5, letterSpacing: '0.01em' }}>
              Student Sign Up
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em' }}>
              JOIN THE CANTEEN
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Register Number"
              fullWidth
              margin="normal"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              required
              autoFocus
              sx={{
                '& .MuiInputLabel-root': { color: '#6C5241' },
                '& .MuiOutlinedInput-input': { color: '#2F2218' },
              }}
            />
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button color="primary" sx={{ textTransform: 'none', fontWeight: 700, p: 0 }} onClick={() => navigate('/login')}>
                Log In
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
