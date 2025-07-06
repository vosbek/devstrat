import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  CheckCircle,
  Error,
  Refresh,
  PlayArrow,
  Pause,
  Assignment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { ApiService, DashboardStats, Job, ContentApproval } from '../services/apiService';

interface DashboardProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface StatCard {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  trend?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ showNotification }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ContentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sample data for charts (replace with real data)
  const jobTrendData = [
    { date: '2024-01-01', completed: 12, failed: 2 },
    { date: '2024-01-02', completed: 15, failed: 1 },
    { date: '2024-01-03', completed: 18, failed: 3 },
    { date: '2024-01-04', completed: 14, failed: 2 },
    { date: '2024-01-05', completed: 20, failed: 1 },
    { date: '2024-01-06', completed: 16, failed: 4 },
    { date: '2024-01-07', completed: 22, failed: 2 },
  ];

  const agentUsageData = [
    { name: 'Tool Discovery', value: 35, color: '#8884d8' },
    { name: 'Deep Evaluation', value: 25, color: '#82ca9d' },
    { name: 'Risk Assessment', value: 20, color: '#ffc658' },
    { name: 'Technical Writer', value: 15, color: '#ff7300' },
    { name: 'Others', value: 5, color: '#8dd1e1' },
  ];

  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadDashboardData(true);
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);

    try {
      // Load dashboard stats
      const statsResponse = await ApiService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        showNotification('Failed to load dashboard statistics', 'error');
      }

      // Load recent jobs
      const jobsResponse = await ApiService.getJobs({ limit: 10 });
      if (jobsResponse.success && jobsResponse.data) {
        setRecentJobs(jobsResponse.data.jobs);
      }

      // Load pending approvals
      const approvalsResponse = await ApiService.getPendingApprovals();
      if (approvalsResponse.success && approvalsResponse.data) {
        setPendingApprovals(approvalsResponse.data.approvals);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatCards = (): StatCard[] => {
    if (!stats) return [];

    return [
      {
        title: 'Total Jobs',
        value: stats.total_jobs,
        color: '#1976d2',
        icon: <Assignment />,
      },
      {
        title: 'Running Jobs',
        value: stats.running_jobs,
        color: '#ed6c02',
        icon: <Schedule />,
      },
      {
        title: 'Completed Jobs',
        value: stats.completed_jobs,
        color: '#2e7d32',
        icon: <CheckCircle />,
      },
      {
        title: 'Pending Approvals',
        value: stats.pending_approvals,
        color: '#9c27b0',
        icon: <Error />,
      },
    ];
  };

  const getJobStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'info';
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}>
            <IconButton
              onClick={() => setAutoRefresh(!autoRefresh)}
              color={autoRefresh ? 'primary' : 'default'}
            >
              {autoRefresh ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => loadDashboardData()} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        {getStatCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Success Rate */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Success Rate
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={stats.success_rate}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {stats.success_rate.toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={stats.running_jobs > 0 ? 'Active' : 'Idle'}
                    color={stats.running_jobs > 0 ? 'success' : 'default'}
                    icon={stats.running_jobs > 0 ? <TrendingUp /> : <Schedule />}
                  />
                  <Chip
                    label={`${stats.pending_approvals} Pending`}
                    color={stats.pending_approvals > 0 ? 'warning' : 'success'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Completion Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={jobTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#d32f2f"
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Usage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={agentUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {agentUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Jobs
              </Typography>
              {recentJobs.length === 0 ? (
                <Alert severity="info">No recent jobs</Alert>
              ) : (
                <List>
                  {recentJobs.slice(0, 5).map((job) => (
                    <ListItem key={job.job_id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {job.agent_name || 'Unknown Agent'}
                            </Typography>
                            <Chip
                              label={job.status}
                              size="small"
                              color={getJobStatusColor(job.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="textSecondary">
                            {formatDateTime(job.created_at)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Box mt={2}>
                <Button variant="outlined" size="small" href="/jobs">
                  View All Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Approvals
              </Typography>
              {pendingApprovals.length === 0 ? (
                <Alert severity="success">No pending approvals</Alert>
              ) : (
                <List>
                  {pendingApprovals.slice(0, 5).map((approval) => (
                    <ListItem key={approval.id} divider>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {approval.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {approval.content_type} • {approval.created_by}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              {formatDateTime(approval.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Box mt={2}>
                <Button variant="outlined" size="small" href="/approvals">
                  Review Approvals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;