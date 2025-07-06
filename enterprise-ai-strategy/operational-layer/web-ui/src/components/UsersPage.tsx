import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Code as DeveloperIcon,
  Business as ExecutiveIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { ApiService } from '../services/apiService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'developer' | 'executive';
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  jobsExecuted: number;
  approvalsCompleted: number;
}

interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'developer' | 'executive';
  department: string;
  isActive: boolean;
  permissions: string[];
}

interface UsersPageProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ showNotification }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialog, setUserDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'developer',
    department: '',
    isActive: true,
    permissions: []
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    status: 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editMode, setEditMode] = useState(false);

  // Mock users data
  const mockUsers: User[] = [
    {
      id: 'user-001',
      email: 'admin@nationwide.com',
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      isActive: true,
      lastLogin: '2024-01-15T09:30:00Z',
      createdAt: '2023-01-01T10:00:00Z',
      permissions: ['manage_users', 'manage_agents', 'approve_content', 'view_analytics'],
      jobsExecuted: 156,
      approvalsCompleted: 89
    },
    {
      id: 'user-002',
      email: 'jane.smith@nationwide.com',
      name: 'Jane Smith',
      role: 'manager',
      department: 'AI Strategy',
      isActive: true,
      lastLogin: '2024-01-15T11:45:00Z',
      createdAt: '2023-03-15T14:20:00Z',
      permissions: ['approve_content', 'view_analytics', 'manage_team'],
      jobsExecuted: 234,
      approvalsCompleted: 145
    },
    {
      id: 'user-003',
      email: 'john.doe@nationwide.com',
      name: 'John Doe',
      role: 'developer',
      department: 'Software Engineering',
      isActive: true,
      lastLogin: '2024-01-15T08:15:00Z',
      createdAt: '2023-06-01T09:00:00Z',
      permissions: ['execute_agents', 'view_jobs'],
      jobsExecuted: 567,
      approvalsCompleted: 0
    },
    {
      id: 'user-004',
      email: 'sarah.wilson@nationwide.com',
      name: 'Sarah Wilson',
      role: 'executive',
      department: 'Executive',
      isActive: true,
      lastLogin: '2024-01-14T16:30:00Z',
      createdAt: '2023-02-10T11:30:00Z',
      permissions: ['view_analytics', 'view_reports'],
      jobsExecuted: 12,
      approvalsCompleted: 0
    },
    {
      id: 'user-005',
      email: 'mike.johnson@nationwide.com',
      name: 'Mike Johnson',
      role: 'developer',
      department: 'Data Engineering',
      isActive: false,
      lastLogin: '2023-12-20T14:00:00Z',
      createdAt: '2023-04-15T13:45:00Z',
      permissions: ['execute_agents', 'view_jobs'],
      jobsExecuted: 89,
      approvalsCompleted: 0
    },
    {
      id: 'user-006',
      email: 'lisa.brown@nationwide.com',
      name: 'Lisa Brown',
      role: 'manager',
      department: 'DevOps',
      isActive: true,
      lastLogin: '2024-01-15T10:00:00Z',
      createdAt: '2023-05-20T10:15:00Z',
      permissions: ['approve_content', 'manage_team', 'view_analytics'],
      jobsExecuted: 178,
      approvalsCompleted: 67
    }
  ];

  const rolePermissions = {
    admin: ['manage_users', 'manage_agents', 'approve_content', 'view_analytics', 'system_settings'],
    manager: ['approve_content', 'view_analytics', 'manage_team', 'view_reports'],
    developer: ['execute_agents', 'view_jobs', 'submit_content'],
    executive: ['view_analytics', 'view_reports', 'strategic_overview']
  };

  const departments = [
    'AI Strategy',
    'Software Engineering',
    'Data Engineering',
    'DevOps',
    'IT',
    'Executive',
    'Product Management',
    'Security'
  ];

  useEffect(() => {
    loadUsers();
  }, [filters, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // In real implementation: const response = await ApiService.getUsers(filters, page);
      setTimeout(() => {
        let filteredUsers = mockUsers;
        
        if (filters.role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        
        if (filters.department !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.department === filters.department);
        }
        
        if (filters.status !== 'all') {
          const isActive = filters.status === 'active';
          filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
        }

        setUsers(filteredUsers);
        setTotalPages(Math.ceil(filteredUsers.length / 10));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load users:', error);
      showNotification('Failed to load users', 'error');
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'developer',
      department: '',
      isActive: true,
      permissions: rolePermissions.developer
    });
    setEditMode(false);
    setUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      permissions: user.permissions
    });
    setEditMode(true);
    setUserDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'developer',
      department: '',
      isActive: true,
      permissions: []
    });
  };

  const handleFormChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update permissions when role changes
      if (field === 'role') {
        updated.permissions = rolePermissions[value as keyof typeof rolePermissions] || [];
      }
      
      return updated;
    });
  };

  const handleSaveUser = async () => {
    try {
      if (editMode && selectedUser) {
        // In real implementation: await ApiService.updateUser(selectedUser.id, formData);
        showNotification('User updated successfully', 'success');
      } else {
        // In real implementation: await ApiService.createUser(formData);
        showNotification('User created successfully', 'success');
      }
      
      handleCloseUserDialog();
      loadUsers();
    } catch (error) {
      showNotification(`Failed to ${editMode ? 'update' : 'create'} user`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // In real implementation: await ApiService.deleteUser(selectedUser.id);
      showNotification('User deleted successfully', 'success');
      setDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // In real implementation: await ApiService.updateUserStatus(userId, isActive);
      showNotification(`User ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      loadUsers();
    } catch (error) {
      showNotification('Failed to update user status', 'error');
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'manager':
        return <ManagerIcon />;
      case 'developer':
        return <DeveloperIcon />;
      case 'executive':
        return <ExecutiveIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '#d32f2f';
      case 'manager':
        return '#f57c00';
      case 'developer':
        return '#1976d2';
      case 'executive':
        return '#7b1fa2';
      default:
        return '#757575';
    }
  };

  const userCounts = {
    all: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
    admin: users.filter(user => user.role === 'admin').length,
    manager: users.filter(user => user.role === 'manager').length,
    developer: users.filter(user => user.role === 'developer').length,
    executive: users.filter(user => user.role === 'executive').length
  };

  const tabLabels = [
    { label: `All (${userCounts.all})`, value: 'all' },
    { label: `Active (${userCounts.active})`, value: 'active' },
    { label: `Inactive (${userCounts.inactive})`, value: 'inactive' }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          User Management
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
          variant="contained"
        >
          Add User
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Manage user accounts, roles, and permissions for the AI Strategy platform.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Users', value: userCounts.all, color: '#1976d2', icon: <PersonIcon /> },
          { label: 'Admins', value: userCounts.admin, color: '#d32f2f', icon: <AdminIcon /> },
          { label: 'Managers', value: userCounts.manager, color: '#f57c00', icon: <ManagerIcon /> },
          { label: 'Developers', value: userCounts.developer, color: '#1976d2', icon: <DeveloperIcon /> }
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabLabels.map((tab, index) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .filter(user => {
                    if (currentTab === 0) return true;
                    if (currentTab === 1) return user.isActive;
                    if (currentTab === 2) return !user.isActive;
                    return true;
                  })
                  .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getRoleIcon(user.role)}
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: 'white'
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <Typography variant="body2">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.jobsExecuted} jobs
                        {user.approvalsCompleted > 0 && `, ${user.approvalsCompleted} approvals`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton size="small" onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                          color={user.isActive ? 'warning' : 'success'}
                        >
                          {user.isActive ? <LockIcon /> : <UnlockIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* User Dialog */}
      <Dialog
        open={userDialog}
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="developer">Developer</MenuItem>
                  <MenuItem value="executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!formData.email || !formData.name || !formData.department}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;