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
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Stop as StopIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { ApiService } from '../services/apiService';

interface Job {
  id: string;
  agentName: string;
  agentDisplayName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  progress?: number;
  estimatedDuration?: number;
  userId: string;
  userName: string;
}

interface JobPageProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const JobsPage: React.FC<JobPageProps> = ({ showNotification }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    agent: 'all',
    dateRange: '7d'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock jobs data
  const mockJobs: Job[] = [
    {
      id: 'job-001',
      agentName: 'tool_discovery',
      agentDisplayName: 'Tool Discovery Agent',
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
      startedAt: '2024-01-15T10:30:15Z',
      completedAt: '2024-01-15T10:35:42Z',
      parameters: { query: 'AI development tools', max_results: 50, sources: 'github' },
      result: { tools_found: 47, evaluation_score: 8.5 },
      progress: 100,
      userId: 'user-123',
      userName: 'John Doe'
    },
    {
      id: 'job-002',
      agentName: 'deep_evaluation',
      agentDisplayName: 'Deep Evaluation Agent',
      status: 'running',
      createdAt: '2024-01-15T11:00:00Z',
      startedAt: '2024-01-15T11:00:30Z',
      parameters: { tool_name: 'GitHub Copilot', evaluation_depth: 'comprehensive' },
      progress: 65,
      estimatedDuration: 900,
      userId: 'user-456',
      userName: 'Jane Smith'
    },
    {
      id: 'job-003',
      agentName: 'executive_briefing',
      agentDisplayName: 'Executive Briefing Agent',
      status: 'failed',
      createdAt: '2024-01-15T09:45:00Z',
      startedAt: '2024-01-15T09:45:20Z',
      completedAt: '2024-01-15T09:47:10Z',
      parameters: { report_type: 'monthly', focus_areas: 'AI adoption, ROI' },
      error: 'Failed to access analytics database',
      userId: 'user-789',
      userName: 'Admin User'
    },
    {
      id: 'job-004',
      agentName: 'curriculum_architect',
      agentDisplayName: 'Curriculum Architect Agent',
      status: 'pending',
      createdAt: '2024-01-15T11:30:00Z',
      parameters: { role: 'full-stack', skill_level: 'intermediate' },
      userId: 'user-123',
      userName: 'John Doe'
    },
    {
      id: 'job-005',
      agentName: 'license_optimizer',
      agentDisplayName: 'License Optimizer Agent',
      status: 'completed',
      createdAt: '2024-01-15T08:00:00Z',
      startedAt: '2024-01-15T08:00:10Z',
      completedAt: '2024-01-15T08:15:30Z',
      parameters: { time_period: 'month', optimization_focus: 'cost' },
      result: { savings_identified: 25000, recommendations: 12 },
      progress: 100,
      userId: 'user-456',
      userName: 'Jane Smith'
    }
  ];

  useEffect(() => {
    loadJobs();
    // Set up auto-refresh for running jobs
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'running' || job.status === 'pending')) {
        loadJobs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [filters, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // In real implementation: const response = await ApiService.getJobs(filters, page);
      // For now, use mock data with filtering
      setTimeout(() => {
        let filteredJobs = mockJobs;
        
        if (filters.status !== 'all') {
          filteredJobs = filteredJobs.filter(job => job.status === filters.status);
        }
        
        if (filters.agent !== 'all') {
          filteredJobs = filteredJobs.filter(job => job.agentName === filters.agent);
        }

        setJobs(filteredJobs);
        setTotalPages(Math.ceil(filteredJobs.length / 10));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      showNotification('Failed to load jobs', 'error');
      setLoading(false);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedJob(null);
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      // In real implementation: await ApiService.cancelJob(jobId);
      showNotification('Job cancelled successfully', 'success');
      loadJobs();
    } catch (error) {
      showNotification('Failed to cancel job', 'error');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      // In real implementation: await ApiService.retryJob(jobId);
      showNotification('Job restarted successfully', 'success');
      loadJobs();
    } catch (error) {
      showNotification('Failed to retry job', 'error');
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CompleteIcon color="success" />;
      case 'running':
        return <PlayIcon color="primary" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'cancelled':
        return <PauseIcon color="disabled" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const jobCounts = {
    all: jobs.length,
    running: jobs.filter(job => job.status === 'running').length,
    completed: jobs.filter(job => job.status === 'completed').length,
    failed: jobs.filter(job => job.status === 'failed').length,
    pending: jobs.filter(job => job.status === 'pending').length
  };

  const tabLabels = [
    { label: `All (${jobCounts.all})`, value: 'all' },
    { label: `Running (${jobCounts.running})`, value: 'running' },
    { label: `Completed (${jobCounts.completed})`, value: 'completed' },
    { label: `Failed (${jobCounts.failed})`, value: 'failed' },
    { label: `Pending (${jobCounts.pending})`, value: 'pending' }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Job Management
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadJobs}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Monitor and manage AI agent job executions across the platform.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Jobs', value: jobCounts.all, color: '#1976d2' },
          { label: 'Running', value: jobCounts.running, color: '#2196f3' },
          { label: 'Completed', value: jobCounts.completed, color: '#4caf50' },
          { label: 'Failed', value: jobCounts.failed, color: '#f44336' }
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Agent</InputLabel>
              <Select
                value={filters.agent}
                onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
                label="Agent"
              >
                <MenuItem value="all">All Agents</MenuItem>
                <MenuItem value="tool_discovery">Tool Discovery</MenuItem>
                <MenuItem value="deep_evaluation">Deep Evaluation</MenuItem>
                <MenuItem value="executive_briefing">Executive Briefing</MenuItem>
                <MenuItem value="curriculum_architect">Curriculum Architect</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                label="Date Range"
              >
                <MenuItem value="1d">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Jobs Table */}
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
                  <TableCell>Job ID</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs
                  .filter(job => currentTab === 0 || job.status === tabLabels[currentTab].value)
                  .map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {job.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{job.agentDisplayName}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(job.status)}
                        <Chip
                          label={job.status}
                          color={getStatusColor(job.status) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(job.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {job.startedAt && (
                        <Typography variant="body2">
                          {formatDuration(job.startedAt, job.completedAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{job.userName}</TableCell>
                    <TableCell sx={{ width: 120 }}>
                      {job.status === 'running' && job.progress !== undefined && (
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={job.progress}
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption">
                            {job.progress}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(job)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {job.status === 'running' && (
                        <Tooltip title="Cancel Job">
                          <IconButton
                            size="small"
                            onClick={() => handleCancelJob(job.id)}
                            color="error"
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {job.status === 'failed' && (
                        <Tooltip title="Retry Job">
                          <IconButton
                            size="small"
                            onClick={() => handleRetryJob(job.id)}
                            color="primary"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {/* Job Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details - {selectedJob?.id}
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Agent
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedJob.agentDisplayName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(selectedJob.status)}
                    <Chip
                      label={selectedJob.status}
                      color={getStatusColor(selectedJob.status) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    User
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedJob.userName}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Parameters
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {JSON.stringify(selectedJob.parameters, null, 2)}
                </pre>
              </Paper>

              {selectedJob.result && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Result
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedJob.result, null, 2)}
                    </pre>
                  </Paper>
                </>
              )}

              {selectedJob.error && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Error
                  </Typography>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {selectedJob.error}
                  </Alert>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Close
          </Button>
          {selectedJob?.result && (
            <Button startIcon={<DownloadIcon />} variant="outlined">
              Download Result
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobsPage;