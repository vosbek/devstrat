import React, { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SmartToy as AgentsIcon,
  Work as JobsIcon,
  Approval as ApprovalsIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Components
import Dashboard from './components/Dashboard';
import AgentsPage from './components/AgentsPage';
import JobsPage from './components/JobsPage';
import ApprovalsPage from './components/ApprovalsPage';
import UsersPage from './components/UsersPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';

// Services
import { AuthService } from './services/authService';
import { ApiService } from './services/apiService';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'AI Agents', icon: <AgentsIcon />, path: '/agents' },
  { text: 'Jobs', icon: <JobsIcon />, path: '/jobs' },
  { text: 'Approvals', icon: <ApprovalsIcon />, path: '/approvals' },
  { text: 'Users', icon: <UsersIcon />, path: '/users', adminOnly: true },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    }
    setUser(currentUser);
  }, [navigate, location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/login');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredNavigationItems = navigationItems.filter(item => 
    !item.adminOnly || (user?.role === 'admin' || user?.role === 'manager')
  );

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AI Strategy Center
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {user && (
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </div>
  );

  if (!user && location.pathname !== '/login') {
    return <LoginPage onLogin={(userData) => {
      setUser(userData);
      navigate('/');
    }} />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Enterprise AI Strategy Command Center
          </Typography>
          {user && (
            <Typography variant="body2">
              Welcome, {user.name} ({user.role})
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={(userData) => {
              setUser(userData);
              navigate('/');
            }} />} />
            <Route path="/" element={<Dashboard showNotification={showNotification} />} />
            <Route path="/agents" element={<AgentsPage showNotification={showNotification} />} />
            <Route path="/jobs" element={<JobsPage showNotification={showNotification} />} />
            <Route path="/approvals" element={<ApprovalsPage showNotification={showNotification} />} />
            <Route path="/users" element={<UsersPage showNotification={showNotification} />} />
            <Route path="/settings" element={<SettingsPage showNotification={showNotification} />} />
          </Routes>
        </Container>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;