import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Grid,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as PendingIcon,
  Assignment as ContentIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { ApiService } from '../services/apiService';

interface ContentApproval {
  id: string;
  jobId: string;
  agentName: string;
  agentDisplayName: string;
  contentType: 'tool_evaluation' | 'training_content' | 'briefing' | 'analysis';
  title: string;
  summary: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  createdAt: string;
  submittedBy: string;
  submittedByName: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewComments?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  metadata: Record<string, any>;
}

interface ApprovalsPageProps {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ showNotification }) => {
  const [approvals, setApprovals] = useState<ContentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<ContentApproval | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    priority: 'all',
    contentType: 'all',
    agent: 'all'
  });

  // Mock approvals data
  const mockApprovals: ContentApproval[] = [
    {
      id: 'approval-001',
      jobId: 'job-001',
      agentName: 'tool_discovery',
      agentDisplayName: 'Tool Discovery Agent',
      contentType: 'tool_evaluation',
      title: 'AI Development Tools Discovery Report',
      summary: 'Comprehensive analysis of 47 AI development tools discovered from GitHub and other sources.',
      content: `# AI Development Tools Discovery Report

## Executive Summary
This report presents findings from an automated discovery process that identified 47 new AI development tools across multiple platforms including GitHub, Product Hunt, and Hacker News.

## Key Findings
- **47 tools discovered** meeting our criteria
- **Average rating**: 8.5/10
- **Top categories**: Code generation (35%), Testing (20%), Documentation (15%)

## Highlighted Tools
1. **CodeMind AI** - Advanced code completion with context awareness
2. **TestGen Pro** - Automated test case generation
3. **DocuBot** - Intelligent documentation generator

## Recommendations
- Immediate evaluation recommended for top 10 tools
- Budget allocation: $150K for licensing
- Implementation timeline: Q2 2024`,
      status: 'pending',
      createdAt: '2024-01-15T10:35:00Z',
      submittedBy: 'system',
      submittedByName: 'AI System',
      priority: 'high',
      tags: ['tools', 'discovery', 'ai', 'development'],
      metadata: { tools_count: 47, evaluation_score: 8.5 }
    },
    {
      id: 'approval-002',
      jobId: 'job-003',
      agentName: 'executive_briefing',
      agentDisplayName: 'Executive Briefing Agent',
      contentType: 'briefing',
      title: 'Monthly AI Strategy Executive Briefing',
      summary: 'Strategic overview of AI adoption progress, ROI metrics, and market positioning for executive leadership.',
      content: `# Monthly AI Strategy Executive Briefing
## January 2024

### Strategic Overview
Our AI transformation initiative continues to deliver exceptional results with a 240% ROI and industry-leading adoption rates.

### Key Metrics
- **Developer Adoption**: 87% (923/1,000 developers)
- **ROI**: 240% with $6.72M annual savings
- **Security Score**: 98% compliance
- **Innovation Ranking**: #1 among insurance companies

### Market Position
Nationwide has achieved advanced AI maturity with a 9.2/10 innovation score, positioning us in the top 15% of the market.`,
      status: 'pending',
      createdAt: '2024-01-15T07:30:00Z',
      submittedBy: 'system',
      submittedByName: 'AI System',
      priority: 'urgent',
      tags: ['executive', 'briefing', 'metrics', 'strategy'],
      metadata: { roi: 240, adoption_rate: 87 }
    },
    {
      id: 'approval-003',
      jobId: 'job-004',
      agentName: 'curriculum_architect',
      agentDisplayName: 'Curriculum Architect Agent',
      contentType: 'training_content',
      title: 'Full-Stack Developer AI Training Curriculum',
      summary: 'Comprehensive learning path for full-stack developers covering AI integration, tools, and best practices.',
      content: `# Full-Stack Developer AI Training Curriculum

## Learning Objectives
- Integrate AI tools into full-stack development workflows
- Understand AI/ML model deployment and management
- Implement AI-powered features in web applications

## Module 1: AI Fundamentals for Developers
- Introduction to AI/ML concepts
- Popular AI frameworks and libraries
- AI ethics and responsible development

## Module 2: AI-Powered Frontend Development
- AI-assisted code generation
- Intelligent UI/UX design tools
- Natural language interfaces

## Module 3: Backend AI Integration
- Model serving and APIs
- AI microservices architecture
- Performance optimization`,
      status: 'approved',
      createdAt: '2024-01-14T16:00:00Z',
      submittedBy: 'system',
      submittedByName: 'AI System',
      reviewedBy: 'user-456',
      reviewedByName: 'Jane Smith',
      reviewedAt: '2024-01-15T09:00:00Z',
      reviewComments: 'Excellent curriculum structure. Approved for immediate implementation.',
      priority: 'medium',
      tags: ['training', 'full-stack', 'curriculum', 'ai'],
      metadata: { modules: 8, estimated_hours: 40 }
    },
    {
      id: 'approval-004',
      jobId: 'job-005',
      agentName: 'risk_assessment',
      agentDisplayName: 'Risk Assessment Agent',
      contentType: 'analysis',
      title: 'GitHub Copilot Enterprise Risk Assessment',
      summary: 'Comprehensive risk analysis covering security, compliance, and operational aspects of GitHub Copilot deployment.',
      content: `# GitHub Copilot Enterprise Risk Assessment

## Risk Overview
GitHub Copilot presents a **LOW to MEDIUM** overall risk profile for enterprise deployment with appropriate safeguards.

## Security Analysis
- **Code Security**: MEDIUM risk - requires code review processes
- **Data Privacy**: LOW risk - no sensitive data transmission
- **IP Protection**: MEDIUM risk - potential code similarity issues

## Compliance Impact
- SOX Compliance: ✅ Compliant with audit trails
- GDPR: ✅ No personal data processing
- Industry Standards: ✅ Meets security requirements

## Recommendations
1. Implement code review checkpoints
2. Configure enterprise privacy settings
3. Establish usage guidelines and training`,
      status: 'rejected',
      createdAt: '2024-01-13T14:30:00Z',
      submittedBy: 'system',
      submittedByName: 'AI System',
      reviewedBy: 'user-789',
      reviewedByName: 'Security Admin',
      reviewedAt: '2024-01-14T11:00:00Z',
      reviewComments: 'Risk assessment incomplete. Missing financial impact analysis and competitor comparison.',
      priority: 'high',
      tags: ['risk', 'assessment', 'github', 'copilot', 'security'],
      metadata: { risk_score: 6.5, compliance_score: 95 }
    }
  ];

  useEffect(() => {
    loadApprovals();
  }, [filters]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      // In real implementation: const response = await ApiService.getApprovals(filters);
      setTimeout(() => {
        let filteredApprovals = mockApprovals;
        
        if (filters.priority !== 'all') {
          filteredApprovals = filteredApprovals.filter(approval => approval.priority === filters.priority);
        }
        
        if (filters.contentType !== 'all') {
          filteredApprovals = filteredApprovals.filter(approval => approval.contentType === filters.contentType);
        }
        
        if (filters.agent !== 'all') {
          filteredApprovals = filteredApprovals.filter(approval => approval.agentName === filters.agent);
        }

        setApprovals(filteredApprovals);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load approvals:', error);
      showNotification('Failed to load approvals', 'error');
      setLoading(false);
    }
  };

  const handleReview = (approval: ContentApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setReviewAction(action);
    setReviewDialog(true);
    setReviewComments('');
  };

  const handlePreview = (approval: ContentApproval) => {
    setSelectedApproval(approval);
    setPreviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApproval || !reviewAction) return;

    try {
      // In real implementation: await ApiService.reviewApproval(selectedApproval.id, reviewAction, reviewComments);
      showNotification(`Content ${reviewAction}d successfully`, 'success');
      setReviewDialog(false);
      setSelectedApproval(null);
      setReviewAction(null);
      setReviewComments('');
      loadApprovals();
    } catch (error) {
      showNotification(`Failed to ${reviewAction} content`, 'error');
    }
  };

  const getPriorityColor = (priority: ContentApproval['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#1976d2';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status: ContentApproval['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'requires_changes':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getContentTypeIcon = (type: ContentApproval['contentType']) => {
    return <ContentIcon />;
  };

  const approvalCounts = {
    all: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    requires_changes: approvals.filter(a => a.status === 'requires_changes').length
  };

  const tabLabels = [
    { label: `All (${approvalCounts.all})`, value: 'all' },
    { label: `Pending (${approvalCounts.pending})`, value: 'pending' },
    { label: `Approved (${approvalCounts.approved})`, value: 'approved' },
    { label: `Rejected (${approvalCounts.rejected})`, value: 'rejected' },
    { label: `Changes (${approvalCounts.requires_changes})`, value: 'requires_changes' }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Content Approvals
          {approvalCounts.pending > 0 && (
            <Badge badgeContent={approvalCounts.pending} color="error" sx={{ ml: 2 }}>
              <PendingIcon />
            </Badge>
          )}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Review and approve AI-generated content before publication to ensure quality and compliance.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Review', value: approvalCounts.pending, color: '#ff9800' },
          { label: 'Approved Today', value: 3, color: '#4caf50' },
          { label: 'Rejected Today', value: 1, color: '#f44336' },
          { label: 'Avg Review Time', value: '2.5h', color: '#2196f3' }
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
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select
                value={filters.contentType}
                onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                label="Content Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="tool_evaluation">Tool Evaluations</MenuItem>
                <MenuItem value="training_content">Training Content</MenuItem>
                <MenuItem value="briefing">Executive Briefings</MenuItem>
                <MenuItem value="analysis">Risk Analysis</MenuItem>
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
                <MenuItem value="executive_briefing">Executive Briefing</MenuItem>
                <MenuItem value="curriculum_architect">Curriculum Architect</MenuItem>
                <MenuItem value="risk_assessment">Risk Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
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
          <Box p={3}>
            <Grid container spacing={3}>
              {approvals
                .filter(approval => currentTab === 0 || approval.status === tabLabels[currentTab].value)
                .map((approval) => (
                <Grid item xs={12} key={approval.id}>
                  <Card
                    sx={{
                      borderLeft: `4px solid ${getPriorityColor(approval.priority)}`,
                      '&:hover': { boxShadow: 3 }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {approval.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {approval.summary}
                          </Typography>
                          <Box display="flex" gap={1} mb={2}>
                            <Chip
                              label={approval.priority}
                              size="small"
                              sx={{
                                backgroundColor: getPriorityColor(approval.priority),
                                color: 'white'
                              }}
                            />
                            <Chip
                              label={approval.status}
                              color={getStatusColor(approval.status) as any}
                              size="small"
                            />
                            <Chip
                              label={approval.agentDisplayName}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {approval.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(approval.createdAt).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            By: {approval.submittedByName}
                          </Typography>
                          {approval.reviewedByName && (
                            <>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                Reviewed by: {approval.reviewedByName}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>

                      {approval.reviewComments && (
                        <Alert severity={approval.status === 'approved' ? 'success' : 'warning'} sx={{ mb: 2 }}>
                          <strong>Review Comments:</strong> {approval.reviewComments}
                        </Alert>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => handlePreview(approval)}
                        >
                          Preview
                        </Button>
                        <Button size="small" startIcon={<DownloadIcon />}>
                          Download
                        </Button>
                      </Box>
                      {approval.status === 'pending' && (
                        <Box>
                          <Button
                            size="small"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleReview(approval, 'approve')}
                            color="success"
                            variant="contained"
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            startIcon={<RejectIcon />}
                            onClick={() => handleReview(approval, 'reject')}
                            color="error"
                            variant="outlined"
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {approvals.filter(approval => currentTab === 0 || approval.status === tabLabels[currentTab].value).length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  No approvals found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No content matches the current filters.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve Content' : 'Reject Content'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedApproval?.title}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Comments"
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            placeholder={
              reviewAction === 'approve' 
                ? 'Add any approval notes or conditions...' 
                : 'Explain why this content is being rejected...'
            }
            required={reviewAction === 'reject'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={reviewAction === 'reject' && !reviewComments.trim()}
          >
            {reviewAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Content Preview - {selectedApproval?.title}
        </DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              maxHeight: '60vh',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap'
            }}
          >
            {selectedApproval?.content}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Close
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalsPage;