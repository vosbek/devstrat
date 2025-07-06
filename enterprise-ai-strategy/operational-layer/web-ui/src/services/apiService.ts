/**
 * API Service
 * Handles all API communications with the backend
 */

import { AuthService } from './authService';

export interface Agent {
  name: string;
  class: string;
  description: string;
}

export interface AgentExecutionRequest {
  agent_name: string;
  task: string;
  parameters?: Record<string, any>;
  priority?: string;
  requires_approval?: boolean;
}

export interface Job {
  job_id: string;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: string;
  error_message?: string;
  approval_status: string;
  approved_by?: string;
  agent_name?: string;
}

export interface ContentApproval {
  id: string;
  job_id: string;
  title: string;
  content_type: string;
  content: string;
  status: string;
  created_at: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_jobs: number;
  running_jobs: number;
  pending_approvals: number;
  completed_jobs: number;
  success_rate: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiService {
  private static readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  /**
   * Make authenticated API request
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        AuthService.logout();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health');
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.makeRequest('/stats/dashboard');
  }

  // Agent Management
  /**
   * Get list of available agents
   */
  static async getAgents(): Promise<ApiResponse<{ agents: Agent[] }>> {
    return this.makeRequest('/agents');
  }

  /**
   * Execute an agent
   */
  static async executeAgent(
    agentName: string,
    request: Omit<AgentExecutionRequest, 'agent_name'>
  ): Promise<ApiResponse<{ job_id: string; status: string; message: string }>> {
    return this.makeRequest(`/agents/${agentName}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        agent_name: agentName,
        ...request,
      }),
    });
  }

  // Job Management
  /**
   * Get job status by ID
   */
  static async getJobStatus(jobId: string): Promise<ApiResponse<Job>> {
    return this.makeRequest(`/jobs/${jobId}`);
  }

  /**
   * List jobs with optional filters
   */
  static async getJobs(params: {
    skip?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{ jobs: Job[] }>> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return this.makeRequest(`/jobs${query ? `?${query}` : ''}`);
  }

  /**
   * Cancel a job
   */
  static async cancelJob(jobId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  // Content Approval Management
  /**
   * Get pending approvals
   */
  static async getPendingApprovals(): Promise<ApiResponse<{ approvals: ContentApproval[] }>> {
    return this.makeRequest('/approvals');
  }

  /**
   * Review an approval (approve or reject)
   */
  static async reviewApproval(
    approvalId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<ApiResponse<{ message: string; approval_id: string }>> {
    return this.makeRequest(`/approvals/${approvalId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        reason: reason || '',
      }),
    });
  }

  /**
   * Get approval details
   */
  static async getApprovalDetails(approvalId: string): Promise<ApiResponse<ContentApproval>> {
    return this.makeRequest(`/approvals/${approvalId}`);
  }

  // User Management
  /**
   * Get list of users (admin only)
   */
  static async getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.makeRequest('/users');
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(userData: {
    email: string;
    name: string;
    role: string;
  }): Promise<ApiResponse<{ message: string; user_id: string }>> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user (admin only)
   */
  static async updateUser(
    userId: string,
    userData: Partial<{
      name: string;
      role: string;
      is_active: boolean;
    }>
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Real-time Updates
  /**
   * Poll for job updates
   */
  static async pollJobUpdates(
    lastCheck: string
  ): Promise<ApiResponse<{ jobs: Job[]; timestamp: string }>> {
    return this.makeRequest(`/jobs/updates?since=${encodeURIComponent(lastCheck)}`);
  }

  /**
   * Poll for approval updates
   */
  static async pollApprovalUpdates(
    lastCheck: string
  ): Promise<ApiResponse<{ approvals: ContentApproval[]; timestamp: string }>> {
    return this.makeRequest(`/approvals/updates?since=${encodeURIComponent(lastCheck)}`);
  }

  // Utility methods
  /**
   * Download job result as file
   */
  static async downloadJobResult(jobId: string, filename: string): Promise<void> {
    const response = await this.getJobStatus(jobId);
    if (response.success && response.data?.result) {
      const blob = new Blob([response.data.result], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  }

  /**
   * Export data as CSV
   */
  static async exportJobsAsCsv(params: { status?: string } = {}): Promise<void> {
    const response = await this.getJobs({ ...params, limit: 1000 });
    if (response.success && response.data?.jobs) {
      const csv = this.convertJobsToCSV(response.data.jobs);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jobs_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  }

  /**
   * Convert jobs array to CSV format
   */
  private static convertJobsToCSV(jobs: Job[]): string {
    const headers = [
      'Job ID',
      'Status',
      'Agent Name',
      'Created At',
      'Started At',
      'Completed At',
      'Approval Status',
      'Approved By',
    ];

    const rows = jobs.map(job => [
      job.job_id,
      job.status,
      job.agent_name || '',
      job.created_at,
      job.started_at || '',
      job.completed_at || '',
      job.approval_status,
      job.approved_by || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Validate API connectivity
   */
  static async validateConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get API base URL for external integrations
   */
  static getApiBaseUrl(): string {
    return this.API_BASE_URL;
  }
}