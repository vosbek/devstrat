import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as ExecuteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  TrendingUp as MarketIcon,
  School as TrainingIcon,
  BusinessCenter as OperationalIcon
} from '@mui/icons-material';
import { ApiService } from '../services/apiService';

interface Agent {
  name: string;
  displayName: string;
  description: string;
  category: 'market_intelligence' | 'training_content' | 'operational';
  parameters: AgentParameter[];
  status: 'active' | 'inactive';
  lastRun?: string;
  totalRuns: number;
}

interface AgentParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  options?: string[];
  default?: any;
}

interface AgentPageProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const AgentsPage: React.FC<AgentPageProps> = ({ showNotification }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [executeDialog, setExecuteDialog] = useState<{
    open: boolean;
    agent: Agent | null;
  }>({
    open: false,
    agent: null
  });
  const [executionParams, setExecutionParams] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);

  // Mock agents data - in real implementation, this would come from the API
  const mockAgents: Agent[] = [
    // Market Intelligence Team
    {
      name: 'tool_discovery',
      displayName: 'Tool Discovery Agent',
      description: 'Discovers new AI tools from GitHub, Hacker News, and other sources',
      category: 'market_intelligence',
      parameters: [
        { name: 'query', type: 'string', description: 'Search query for tools', required: true },
        { name: 'max_results', type: 'number', description: 'Maximum number of results', required: false, default: 50 },
        { name: 'sources', type: 'select', description: 'Data sources to search', required: false, options: ['github', 'hackernews', 'producthunt', 'all'], default: 'all' }
      ],
      status: 'active',
      lastRun: '2024-01-15T10:30:00Z',
      totalRuns: 245
    },
    {
      name: 'deep_evaluation',
      displayName: 'Deep Evaluation Agent',
      description: 'Generates comprehensive 10-page evaluations of AI tools',
      category: 'market_intelligence',
      parameters: [
        { name: 'tool_name', type: 'string', description: 'Name of the tool to evaluate', required: true },
        { name: 'evaluation_depth', type: 'select', description: 'Depth of evaluation', required: false, options: ['basic', 'comprehensive', 'enterprise'], default: 'comprehensive' }
      ],
      status: 'active',
      lastRun: '2024-01-14T15:45:00Z',
      totalRuns: 89
    },
    {
      name: 'risk_assessment',
      displayName: 'Risk Assessment Agent',
      description: 'Analyzes security, compliance, and operational risks',
      category: 'market_intelligence',
      parameters: [
        { name: 'tool_name', type: 'string', description: 'Tool to assess', required: true },
        { name: 'risk_categories', type: 'select', description: 'Risk categories to evaluate', required: false, options: ['security', 'compliance', 'operational', 'all'], default: 'all' }
      ],
      status: 'active',
      lastRun: '2024-01-13T09:15:00Z',
      totalRuns: 156
    },
    {
      name: 'competitive_intelligence',
      displayName: 'Competitive Intelligence Agent',
      description: 'Analyzes market positioning and competitive landscape',
      category: 'market_intelligence',
      parameters: [
        { name: 'market_segment', type: 'string', description: 'Market segment to analyze', required: true },
        { name: 'competitors', type: 'string', description: 'Competitor list (comma-separated)', required: false }
      ],
      status: 'active',
      lastRun: '2024-01-12T14:20:00Z',
      totalRuns: 78
    },
    // Training Content Team
    {
      name: 'curriculum_architect',
      displayName: 'Curriculum Architect Agent',
      description: 'Designs progressive learning paths for developers',
      category: 'training_content',
      parameters: [
        { name: 'role', type: 'select', description: 'Developer role', required: true, options: ['full-stack', 'sre', 'etl', 'java-spring', 'k8s-helm'] },
        { name: 'skill_level', type: 'select', description: 'Target skill level', required: false, options: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' }
      ],
      status: 'active',
      lastRun: '2024-01-15T11:00:00Z',
      totalRuns: 134
    },
    {
      name: 'technical_writer',
      displayName: 'Technical Writer Agent',
      description: 'Creates in-depth technical content and documentation',
      category: 'training_content',
      parameters: [
        { name: 'topic', type: 'string', description: 'Topic to write about', required: true },
        { name: 'content_type', type: 'select', description: 'Type of content', required: false, options: ['tutorial', 'guide', 'reference', 'overview'], default: 'tutorial' },
        { name: 'audience', type: 'select', description: 'Target audience', required: false, options: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' }
      ],
      status: 'active',
      lastRun: '2024-01-14T16:30:00Z',
      totalRuns: 98
    },
    {
      name: 'assessment_creator',
      displayName: 'Assessment Creator Agent',
      description: 'Creates competency tests and practical exercises',
      category: 'training_content',
      parameters: [
        { name: 'skill_area', type: 'string', description: 'Skill area to assess', required: true },
        { name: 'assessment_type', type: 'select', description: 'Type of assessment', required: false, options: ['quiz', 'practical', 'project'], default: 'quiz' }
      ],
      status: 'active',
      lastRun: '2024-01-13T13:45:00Z',
      totalRuns: 67
    },
    {
      name: 'resource_curator',
      displayName: 'Resource Curator Agent',
      description: 'Curates and organizes learning resources',
      category: 'training_content',
      parameters: [
        { name: 'topic', type: 'string', description: 'Topic for resource curation', required: true },
        { name: 'resource_types', type: 'select', description: 'Types of resources', required: false, options: ['articles', 'videos', 'books', 'courses', 'all'], default: 'all' }
      ],
      status: 'active',
      lastRun: '2024-01-12T10:15:00Z',
      totalRuns: 112
    },
    // Operational Intelligence Team
    {
      name: 'license_optimizer',
      displayName: 'License Optimizer Agent',
      description: 'Analyzes usage patterns and optimizes costs',
      category: 'operational',
      parameters: [
        { name: 'time_period', type: 'select', description: 'Analysis time period', required: false, options: ['week', 'month', 'quarter'], default: 'month' },
        { name: 'optimization_focus', type: 'select', description: 'Optimization focus', required: false, options: ['cost', 'usage', 'efficiency'], default: 'cost' }
      ],
      status: 'active',
      lastRun: '2024-01-15T08:00:00Z',
      totalRuns: 189
    },
    {
      name: 'integration_validator',
      displayName: 'Integration Validator Agent',
      description: 'Tests enterprise compatibility and integration points',
      category: 'operational',
      parameters: [
        { name: 'tool_name', type: 'string', description: 'Tool to validate', required: true },
        { name: 'integration_type', type: 'select', description: 'Integration type', required: false, options: ['api', 'sso', 'data', 'all'], default: 'all' }
      ],
      status: 'active',
      lastRun: '2024-01-14T12:30:00Z',
      totalRuns: 145
    },
    {
      name: 'community_pulse',
      displayName: 'Community Pulse Agent',
      description: 'Tracks developer sentiment and engagement',
      category: 'operational',
      parameters: [
        { name: 'metric_type', type: 'select', description: 'Metric to analyze', required: false, options: ['sentiment', 'engagement', 'adoption', 'all'], default: 'all' },
        { name: 'team_filter', type: 'string', description: 'Filter by team (optional)', required: false }
      ],
      status: 'active',
      lastRun: '2024-01-13T16:00:00Z',
      totalRuns: 234
    },
    {
      name: 'executive_briefing',
      displayName: 'Executive Briefing Agent',
      description: 'Generates C-suite ready reports and position papers',
      category: 'operational',
      parameters: [
        { name: 'report_type', type: 'select', description: 'Type of report', required: true, options: ['weekly', 'monthly', 'quarterly', 'strategic'] },
        { name: 'focus_areas', type: 'string', description: 'Key focus areas (comma-separated)', required: false }
      ],
      status: 'active',
      lastRun: '2024-01-15T07:00:00Z',
      totalRuns: 45
    }
  ];

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      // In real implementation: const response = await ApiService.getAgents();
      // For now, use mock data
      setTimeout(() => {
        setAgents(mockAgents);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load agents:', error);
      showNotification('Failed to load agents', 'error');
      setLoading(false);
    }
  };

  const handleExecuteAgent = (agent: Agent) => {
    setExecuteDialog({ open: true, agent });
    // Initialize parameters with defaults
    const defaultParams: Record<string, any> = {};
    agent.parameters.forEach(param => {
      if (param.default !== undefined) {
        defaultParams[param.name] = param.default;
      }
    });
    setExecutionParams(defaultParams);
  };

  const handleCloseExecuteDialog = () => {
    setExecuteDialog({ open: false, agent: null });
    setExecutionParams({});
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setExecutionParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleConfirmExecution = async () => {
    if (!executeDialog.agent) return;

    try {
      setExecuting(true);
      // In real implementation:
      // await ApiService.executeAgent(executeDialog.agent.name, executionParams);
      
      // Mock execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification(`Agent "${executeDialog.agent.displayName}" executed successfully`, 'success');
      handleCloseExecuteDialog();
      loadAgents(); // Refresh agents list
    } catch (error) {
      console.error('Failed to execute agent:', error);
      showNotification('Failed to execute agent', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const getCategoryIcon = (category: Agent['category']) => {
    switch (category) {
      case 'market_intelligence':
        return <MarketIcon />;
      case 'training_content':
        return <TrainingIcon />;
      case 'operational':
        return <OperationalIcon />;
      default:
        return <AIIcon />;
    }
  };

  const getCategoryColor = (category: Agent['category']) => {
    switch (category) {
      case 'market_intelligence':
        return '#1976d2';
      case 'training_content':
        return '#388e3c';
      case 'operational':
        return '#f57c00';
      default:
        return '#757575';
    }
  };

  const groupedAgents = agents.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Agents
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage and execute the 12 specialized AI agents for market intelligence, training content, and operational insights.
      </Typography>

      {Object.entries(groupedAgents).map(([category, categoryAgents]) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              {getCategoryIcon(category as Agent['category'])}
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {category.replace('_', ' ')} Team ({categoryAgents.length} agents)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {categoryAgents.map((agent) => (
                <Grid item xs={12} md={6} lg={4} key={agent.name}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: `4px solid ${getCategoryColor(agent.category)}`
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" component="h2">
                          {agent.displayName}
                        </Typography>
                        <Chip
                          label={agent.status}
                          color={agent.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {agent.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Total runs: {agent.totalRuns}
                        </Typography>
                        {agent.lastRun && (
                          <Typography variant="caption" color="text.secondary">
                            Last run: {new Date(agent.lastRun).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<ExecuteIcon />}
                        onClick={() => handleExecuteAgent(agent)}
                        disabled={agent.status !== 'active'}
                        variant="contained"
                        sx={{
                          backgroundColor: getCategoryColor(agent.category),
                          '&:hover': {
                            backgroundColor: getCategoryColor(agent.category),
                            opacity: 0.8
                          }
                        }}
                      >
                        Execute
                      </Button>
                      <Tooltip title="View agent details">
                        <IconButton size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Execute Agent Dialog */}
      <Dialog
        open={executeDialog.open}
        onClose={handleCloseExecuteDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Execute {executeDialog.agent?.displayName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {executeDialog.agent?.description}
          </Typography>
          
          {executeDialog.agent?.parameters.map((param) => (
            <Box key={param.name} sx={{ mb: 2 }}>
              {param.type === 'select' ? (
                <FormControl fullWidth>
                  <InputLabel>{param.description}</InputLabel>
                  <Select
                    value={executionParams[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    label={param.description}
                    required={param.required}
                  >
                    {param.options?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label={param.description}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={executionParams[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  required={param.required}
                  helperText={param.required ? 'Required' : 'Optional'}
                />
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExecuteDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmExecution}
            variant="contained"
            disabled={executing}
            startIcon={executing ? <CircularProgress size={16} /> : <ExecuteIcon />}
          >
            {executing ? 'Executing...' : 'Execute Agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentsPage;