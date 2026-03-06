import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, IconButton, Box, Avatar, Menu, MenuItem, Divider, Chip,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, Restaurant, ShoppingCart,
  LocalShipping, Inventory, Assessment, Brightness4, Brightness7,
  Logout, ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Food Items', icon: <Restaurant />, path: '/food-items' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
  { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
  { text: 'Stock', icon: <Inventory />, path: '/stock' },
  { text: 'Reports', icon: <Assessment />, path: '/reports', adminOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Restaurant sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Canteen
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavClick(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
                '&:hover': { backgroundColor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Chip
          label={user?.role === 'admin' ? 'Admin' : 'Staff'}
          color={user?.role === 'admin' ? 'primary' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: !isMobile && drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s',
          ml: !isMobile && drawerOpen ? 0 : 0,
          width: !isMobile && drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        }}
      >
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
              {filteredMenuItems.find((i) => i.path === location.pathname)?.text || 'Canteen Management'}
            </Typography>
            <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 16 }}>
                {user?.fullName?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.fullName}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
