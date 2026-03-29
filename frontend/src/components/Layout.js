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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress((window.scrollY / total) * 100);
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, [location.pathname]);

  useEffect(() => {
    const selector = '.MuiCard-root, .MuiPaper-root, .MuiTableContainer-root, .MuiDialog-paper';
    const tracked = new Set();

    const applyRevealClass = (node) => {
      if (!(node instanceof HTMLElement)) return;
      if (!node.matches(selector)) return;
      if (tracked.has(node)) return;
      tracked.add(node);
      node.classList.add('scroll-reveal');
      observer.observe(node);
    };

    const scan = () => {
      document.querySelectorAll(selector).forEach((el) => applyRevealClass(el));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    const domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          applyRevealClass(node);
          node.querySelectorAll?.(selector).forEach((child) => applyRevealClass(child));
        });
      });
    });

    scan();
    domObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      tracked.forEach((el) => {
        observer.unobserve(el);
        el.classList.remove('scroll-reveal', 'in-view');
      });
      domObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);

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
          <Restaurant sx={{ color: 'primary.main', fontSize: 34 }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'primary.main', lineHeight: 1.1 }}>
              Retro Bites
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Canteen Control Room
            </Typography>
          </Box>
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
    <Box className="page-shell" sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 4,
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #F2A53D 0%, #C64B33 60%, #EA7A58 100%)',
          zIndex: (t) => t.zIndex.tooltip + 1,
          transition: 'width 0.18s ease-out',
          boxShadow: '0 2px 12px rgba(198, 75, 51, 0.55)',
        }}
      />

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
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                {filteredMenuItems.find((i) => i.path === location.pathname)?.text || 'Canteen Management'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                  Fresh. Fast. Flavorful.
                </Typography>
              </Box>
            </Box>
            <Box className="retro-toggle" sx={{ mr: 1 }}>
              <IconButton onClick={toggleTheme} aria-label="toggle theme" size="small">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
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

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
