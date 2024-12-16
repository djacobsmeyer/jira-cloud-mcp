import axios from 'axios';
import { JiraIssue } from './types.js';

export class JiraClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    const domain = process.env.JIRA_DOMAIN!;
    const email = process.env.JIRA_EMAIL!;
    const apiToken = process.env.JIRA_API_TOKEN!;

    this.baseUrl = `https://${domain}`;
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async searchIssues(jql: string): Promise<JiraIssue[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/search`, {
        headers: this.headers,
        params: { 
          jql, 
          fields: 'summary,description,status,priority,assignee,timeoriginalestimate,customfield_10020'
        }
      });
      return response.data.issues;
    } catch (error) {
      console.error('Error searching Jira issues:', error);
      throw error;
    }
  }

  async createIssue(project: string, summary: string, description: string): Promise<JiraIssue> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        {
          fields: {
            project: { key: project },
            summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: description }]
                }
              ]
            },
            issuetype: { name: 'Task' }
          }
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Jira issue:', error);
      throw error;
    }
  }

  async getPermissionSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/permissionscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching permission schemes:', error);
      throw error;
    }
  }

  async getPriorities(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/priority`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching priorities:', error);
      throw error;
    }
  }

  async getNotificationSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/notificationscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification schemes:', error);
      throw error;
    }
  }

  async getSecuritySchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/issuesecurityschemes`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching security schemes:', error);
      throw error;
    }
  }

  async getSecurityLevels(schemeId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/issuesecurityschemes/${schemeId}/levels`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching security levels:', error);
      throw error;
    }
  }

  async getFieldConfigurations(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/fieldconfiguration`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching field configurations:', error);
      throw error;
    }
  }

  async getFieldConfigurationSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/fieldconfigurationscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching field configuration schemes:', error);
      throw error;
    }
  }

  async getScreens(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/screens`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching screens:', error);
      throw error;
    }
  }

  async getScreenSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/screenscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching screen schemes:', error);
      throw error;
    }
  }

  async getIssueTypeScreenSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/issuetypescreenscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching issue type screen schemes:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/workflow/search`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  async getWorkflowSchemes(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/workflowscheme`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow schemes:', error);
      throw error;
    }
  }

  async getWorkflowStatuses(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/status`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow statuses:', error);
      throw error;
    }
  }

  async getWorkflowTransitions(workflowId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/workflow/${workflowId}/transitions`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow transitions:', error);
      throw error;
    }
  }
} 