import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TestTube as TestIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

interface SettingsPageProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface SystemSettings {
  general: {
    systemName: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  ai: {
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    enableCaching: boolean;
    rateLimitPerUser: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireMFA: boolean;
    allowedDomains: string[];
    maxLoginAttempts: number;
  };
  notifications: {
    enableEmail: boolean;
    enableSlack: boolean;
    emailServer: string;
    slackWebhook: string;
    defaultRecipients: string[];
  };
  storage: {
    retentionDays: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    backupFrequency: string;
  };
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  service: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  lastUsed?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showNotification }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'Enterprise AI Strategy Command Center',
      timezone: 'America/New_York',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    ai: {
      defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      maxTokens: 4000,
      temperature: 0.7,
      enableCaching: true,
      rateLimitPerUser: 100
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 8,
      requireMFA: false,
      allowedDomains: ['nationwide.com'],
      maxLoginAttempts: 5
    },
    notifications: {
      enableEmail: true,
      enableSlack: false,
      emailServer: 'smtp.nationwide.com',
      slackWebhook: '',
      defaultRecipients: ['admin@nationwide.com']
    },
    storage: {
      retentionDays: 90,
      maxFileSize: 100,
      allowedFileTypes: ['pdf', 'docx', 'txt', 'md'],
      backupFrequency: 'daily'
    }
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-001',
      name: 'AWS Bedrock',
      key: 'AKIA...****',
      service: 'aws',
      status: 'active',
      createdAt: '2024-01-01T10:00:00Z',
      lastUsed: '2024-01-15T11:30:00Z'
    },
    {
      id: 'key-002',
      name: 'Anthropic Claude',
      key: 'sk-ant-...****',
      service: 'anthropic',
      status: 'active',
      createdAt: '2024-01-01T10:05:00Z',
      lastUsed: '2024-01-15T11:45:00Z'
    },
    {
      id: 'key-003',
      name: 'Slack Integration',
      key: 'xoxb-...****',
      service: 'slack',
      status: 'inactive',
      createdAt: '2024-01-10T14:00:00Z'
    }
  ]);

  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    service: '',
    key: ''
  });
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);

  const handleSettingChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In real implementation: await ApiService.updateSettings(settings);
      showNotification('Settings saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    }
  };

  const handleTestConnection = async (service: string) => {
    setTesting(true);
    try {
      // In real implementation: const result = await ApiService.testConnection(service);
      const mockResult = {
        success: true,
        responseTime: Math.floor(Math.random() * 500) + 100,
        message: 'Connection successful'
      };
      
      setTestResults(prev => ({ ...prev, [service]: mockResult }));
      showNotification(`${service} connection test successful`, 'success');
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: false, 
          message: 'Connection failed' 
        } 
      }));
      showNotification(`${service} connection test failed`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.service || !newApiKey.key) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    const apiKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newApiKey.name,
      key: newApiKey.key.slice(0, 8) + '****',
      service: newApiKey.service,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewApiKey({ name: '', service: '', key: '' });
    setApiKeyDialog(false);
    showNotification('API key added successfully', 'success');
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    showNotification('API key deleted successfully', 'success');
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ai-strategy-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Settings exported successfully', 'success');
  };

  const getStatusColor = (status: ApiKey['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const systemHealth = {
    database: { status: 'healthy', responseTime: '45ms' },
    redis: { status: 'healthy', responseTime: '12ms' },
    aws: { status: 'healthy', responseTime: '156ms' },
    anthropic: { status: 'healthy', responseTime: '234ms' }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          System Settings
        </Typography>
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExportSettings}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Export
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            variant="contained"
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Configure system settings, API integrations, and security policies.
      </Typography>

      {/* System Health Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Health
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(systemHealth).map(([service, health]) => (
            <Grid item xs={12} sm={6} md={3} key={service}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {service}
                    </Typography>
                    <Chip
                      label={health.status}
                      color={health.status === 'healthy' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Response: {health.responseTime}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* General Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">General Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="System Name"
                value={settings.general.systemName}
                onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  label="Timezone"
                >
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Chicago">Central Time</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.general.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.debugMode}
                    onChange={(e) => handleSettingChange('general', 'debugMode', e.target.checked)}
                  />
                }
                label="Debug Mode"
                sx={{ ml: 3 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* AI Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <ApiIcon />
            <Typography variant="h6">AI Configuration</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Model</InputLabel>
                <Select
                  value={settings.ai.defaultModel}
                  onChange={(e) => handleSettingChange('ai', 'defaultModel', e.target.value)}
                  label="Default Model"
                >
                  <MenuItem value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet</MenuItem>
                  <MenuItem value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</MenuItem>
                  <MenuItem value="anthropic.claude-3-opus-20240229-v1:0">Claude 3 Opus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) => handleSettingChange('ai', 'maxTokens', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                value={settings.ai.temperature}
                onChange={(e) => handleSettingChange('ai', 'temperature', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rate Limit (per user/hour)"
                type="number"
                value={settings.ai.rateLimitPerUser}
                onChange={(e) => handleSettingChange('ai', 'rateLimitPerUser', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ai.enableCaching}
                    onChange={(e) => handleSettingChange('ai', 'enableCaching', e.target.checked)}
                  />
                }
                label="Enable Response Caching"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Security Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon />
            <Typography variant="h6">Security</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password Min Length"
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.requireMFA}
                    onChange={(e) => handleSettingChange('security', 'requireMFA', e.target.checked)}
                  />
                }
                label="Require Multi-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allowed Email Domains (comma-separated)"
                value={settings.security.allowedDomains.join(', ')}
                onChange={(e) => handleSettingChange('security', 'allowedDomains', e.target.value.split(',').map(d => d.trim()))}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* API Keys Management */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <ApiIcon />
            <Typography variant="h6">API Keys</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Manage API keys for external services
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setApiKeyDialog(true)}
              variant="outlined"
            >
              Add API Key
            </Button>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{apiKey.service}</TableCell>
                    <TableCell fontFamily="monospace">{apiKey.key}</TableCell>
                    <TableCell>
                      <Chip
                        label={apiKey.status}
                        color={getStatusColor(apiKey.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {apiKey.lastUsed 
                        ? new Date(apiKey.lastUsed).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleTestConnection(apiKey.service)}
                        disabled={testing}
                      >
                        <TestIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Connection Test Results:
              </Typography>
              {Object.entries(testResults).map(([service, result]) => (
                <Alert
                  key={service}
                  severity={result.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <strong>{service}:</strong> {result.message}
                  {result.responseTime && ` (${result.responseTime}ms)`}
                </Alert>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Notifications */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon />
            <Typography variant="h6">Notifications</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.enableEmail}
                    onChange={(e) => handleSettingChange('notifications', 'enableEmail', e.target.checked)}
                  />
                }
                label="Enable Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.enableSlack}
                    onChange={(e) => handleSettingChange('notifications', 'enableSlack', e.target.checked)}
                  />
                }
                label="Enable Slack Notifications"
                sx={{ ml: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Server"
                value={settings.notifications.emailServer}
                onChange={(e) => handleSettingChange('notifications', 'emailServer', e.target.value)}
                disabled={!settings.notifications.enableEmail}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slack Webhook URL"
                value={settings.notifications.slackWebhook}
                onChange={(e) => handleSettingChange('notifications', 'slackWebhook', e.target.value)}
                disabled={!settings.notifications.enableSlack}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Recipients (comma-separated)"
                value={settings.notifications.defaultRecipients.join(', ')}
                onChange={(e) => handleSettingChange('notifications', 'defaultRecipients', e.target.value.split(',').map(r => r.trim()))}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Storage Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <StorageIcon />
            <Typography variant="h6">Storage & Backup</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Retention (days)"
                type="number"
                value={settings.storage.retentionDays}
                onChange={(e) => handleSettingChange('storage', 'retentionDays', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max File Size (MB)"
                type="number"
                value={settings.storage.maxFileSize}
                onChange={(e) => handleSettingChange('storage', 'maxFileSize', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.storage.backupFrequency}
                  onChange={(e) => handleSettingChange('storage', 'backupFrequency', e.target.value)}
                  label="Backup Frequency"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allowed File Types (comma-separated)"
                value={settings.storage.allowedFileTypes.join(', ')}
                onChange={(e) => handleSettingChange('storage', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Add API Key Dialog */}
      <Dialog
        open={apiKeyDialog}
        onClose={() => setApiKeyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newApiKey.name}
                onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                placeholder="e.g., Production AWS Key"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={newApiKey.service}
                  onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                  label="Service"
                >
                  <MenuItem value="aws">AWS</MenuItem>
                  <MenuItem value="anthropic">Anthropic</MenuItem>
                  <MenuItem value="slack">Slack</MenuItem>
                  <MenuItem value="github">GitHub</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={newApiKey.key}
                onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                placeholder="Enter the API key"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddApiKey} variant="contained">
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;