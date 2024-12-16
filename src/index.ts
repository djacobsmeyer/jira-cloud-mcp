#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { JiraClient } from './jiraClient.js';
import { JiraIssue } from './types.js';

class JiraCloudMCP {
  private server: Server;
  private jiraClient: JiraClient;

  constructor() {
    this.jiraClient = new JiraClient();
    this.server = new Server(
      {
        name: "jira-cloud-mcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const issues = await this.jiraClient.searchIssues('order by created DESC');
        return {
          resources: issues.map((issue) => ({
            uri: `jira:///${issue.key}`,
            mimeType: "application/json",
            name: issue.fields.summary,
            description: `Jira issue: ${issue.key} - ${issue.fields.summary}`
          }))
        };
      } catch (error) {
        console.error('Error listing Jira issues:', error);
        throw error;
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const url = new URL(request.params.uri);
      const issueKey = url.pathname.replace(/^\//, '');
      
      try {
        const issues = await this.jiraClient.searchIssues(`key = ${issueKey}`);
        if (issues.length === 0) {
          throw new Error(`Issue ${issueKey} not found`);
        }

        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(issues[0], null, 2)
          }]
        };
      } catch (error) {
        console.error('Error reading Jira issue:', error);
        throw error;
      }
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_issues",
            description: "Search Jira issues using JQL",
            inputSchema: {
              type: "object",
              properties: {
                jql: {
                  type: "string",
                  description: "JQL query string"
                }
              },
              required: ["jql"]
            }
          },
          {
            name: "create_issue",
            description: "Create a new Jira issue",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description: "Project key"
                },
                summary: {
                  type: "string",
                  description: "Issue summary"
                },
                description: {
                  type: "string",
                  description: "Issue description"
                }
              },
              required: ["project", "summary", "description"]
            }
          },
          {
            name: "get_permission_schemes",
            description: "Get all permission schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_priorities",
            description: "Get all priorities",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_notification_schemes",
            description: "Get all notification schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_security_schemes",
            description: "Get all security schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_security_levels",
            description: "Get security levels for a specific scheme",
            inputSchema: {
              type: "object",
              properties: {
                schemeId: {
                  type: "string",
                  description: "Security scheme ID"
                }
              },
              required: ["schemeId"]
            }
          },
          {
            name: "get_field_configurations",
            description: "Get all field configurations",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_field_configuration_schemes",
            description: "Get all field configuration schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_screens",
            description: "Get all screens",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_screen_schemes",
            description: "Get all screen schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_issue_type_screen_schemes",
            description: "Get all issue type screen schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_workflows",
            description: "Get all workflows",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_workflow_schemes",
            description: "Get all workflow schemes",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_workflow_statuses",
            description: "Get all workflow statuses",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_workflow_transitions",
            description: "Get transitions for a specific workflow",
            inputSchema: {
              type: "object",
              properties: {
                workflowId: {
                  type: "string",
                  description: "Workflow ID"
                }
              },
              required: ["workflowId"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "search_issues": {
          const jql = String(request.params.arguments?.jql);
          if (!jql) {
            throw new Error("JQL query is required");
          }

          try {
            const issues = await this.jiraClient.searchIssues(jql);
            return {
              content: [{
                type: "text",
                text: `Found ${issues.length} issues:\n${issues.map(issue => 
                  `${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`
                ).join('\n')}`
              }]
            };
          } catch (error) {
            console.error('Error searching issues:', error);
            throw error;
          }
        }

        case "create_issue": {
          const project = String(request.params.arguments?.project);
          const summary = String(request.params.arguments?.summary);
          const description = String(request.params.arguments?.description);

          if (!project || !summary || !description) {
            throw new Error("Project, summary, and description are required");
          }

          try {
            const issue = await this.jiraClient.createIssue(project, summary, description);
            return {
              content: [{
                type: "text",
                text: `Created issue ${issue.key}: ${summary}`
              }]
            };
          } catch (error) {
            console.error('Error creating issue:', error);
            throw error;
          }
        }

        case "get_permission_schemes": {
          const data = await this.jiraClient.getPermissionSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///permission-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_priorities": {
          const data = await this.jiraClient.getPriorities();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///priorities",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_notification_schemes": {
          const data = await this.jiraClient.getNotificationSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///notification-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_security_schemes": {
          const data = await this.jiraClient.getSecuritySchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///security-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_security_levels": {
          const schemeId = String(request.params.arguments?.schemeId);
          if (!schemeId) {
            throw new Error("Security scheme ID is required");
          }
          const data = await this.jiraClient.getSecurityLevels(schemeId);
          return {
            content: [{
              type: "resource",
              resource: {
                uri: `jira:///security-schemes/${schemeId}/levels`,
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_field_configurations": {
          const data = await this.jiraClient.getFieldConfigurations();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///field-configurations",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_field_configuration_schemes": {
          const data = await this.jiraClient.getFieldConfigurationSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///field-configuration-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_screens": {
          const data = await this.jiraClient.getScreens();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///screens",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_screen_schemes": {
          const data = await this.jiraClient.getScreenSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///screen-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_issue_type_screen_schemes": {
          const data = await this.jiraClient.getIssueTypeScreenSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///issue-type-screen-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_workflows": {
          const data = await this.jiraClient.getWorkflows();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///workflows",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_workflow_schemes": {
          const data = await this.jiraClient.getWorkflowSchemes();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///workflow-schemes",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_workflow_statuses": {
          const data = await this.jiraClient.getWorkflowStatuses();
          return {
            content: [{
              type: "resource",
              resource: {
                uri: "jira:///workflow-statuses",
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        case "get_workflow_transitions": {
          const workflowId = String(request.params.arguments?.workflowId);
          if (!workflowId) {
            throw new Error("Workflow ID is required");
          }
          const data = await this.jiraClient.getWorkflowTransitions(workflowId);
          return {
            content: [{
              type: "resource",
              resource: {
                uri: `jira:///workflows/${workflowId}/transitions`,
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2)
              }
            }]
          };
        }

        default:
          throw new Error("Unknown tool");
      }
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "summarize_issues",
            description: "Summarize Jira issues",
          },
          {
            name: "analyze_permission_schemes",
            description: "Analyze permission schemes configuration",
          },
          {
            name: "analyze_priorities",
            description: "Analyze priorities configuration",
          },
          {
            name: "analyze_notification_schemes",
            description: "Analyze notification schemes configuration",
          },
          {
            name: "analyze_security_schemes",
            description: "Analyze security schemes configuration",
          },
          {
            name: "analyze_field_configurations",
            description: "Analyze field configurations",
          },
          {
            name: "analyze_screens",
            description: "Analyze screens and screen schemes",
          },
          {
            name: "analyze_workflows",
            description: "Analyze workflows and workflow schemes",
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      switch (request.params.name) {
        case "summarize_issues": {
          const issues = await this.jiraClient.searchIssues('order by created DESC');
          const embeddedIssues = issues.map(issue => ({
            type: "resource" as const,
            resource: {
              uri: `jira:///${issue.key}`,
              mimeType: "application/json",
              text: JSON.stringify(issue, null, 2)
            }
          }));

          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please summarize the following Jira issues:"
                }
              },
              ...embeddedIssues.map(issue => ({
                role: "user" as const,
                content: issue
              })),
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide a concise summary of all the Jira issues above."
                }
              }
            ]
          };
        }

        case "analyze_permission_schemes": {
          const data = await this.jiraClient.getPermissionSchemes();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira permission schemes:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///permission-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(data, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide a detailed analysis of the permission schemes, including key permissions, roles, and any potential security concerns."
                }
              }
            ]
          };
        }

        case "analyze_priorities": {
          const data = await this.jiraClient.getPriorities();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira priorities:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///priorities",
                    mimeType: "application/json",
                    text: JSON.stringify(data, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide a summary of the priority levels and their intended use cases."
                }
              }
            ]
          };
        }

        case "analyze_notification_schemes": {
          const data = await this.jiraClient.getNotificationSchemes();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira notification schemes:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///notification-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(data, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide an analysis of the notification schemes, including event triggers and recipients."
                }
              }
            ]
          };
        }

        case "analyze_security_schemes": {
          const data = await this.jiraClient.getSecuritySchemes();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira security schemes:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///security-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(data, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide an analysis of the security schemes, including access levels and potential security implications."
                }
              }
            ]
          };
        }

        case "analyze_field_configurations": {
          const configs = await this.jiraClient.getFieldConfigurations();
          const schemes = await this.jiraClient.getFieldConfigurationSchemes();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira field configurations and schemes:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///field-configurations",
                    mimeType: "application/json",
                    text: JSON.stringify(configs, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///field-configuration-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(schemes, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide an analysis of the field configurations and schemes, including custom fields and their usage."
                }
              }
            ]
          };
        }

        case "analyze_screens": {
          const screens = await this.jiraClient.getScreens();
          const schemes = await this.jiraClient.getScreenSchemes();
          const issueTypeSchemes = await this.jiraClient.getIssueTypeScreenSchemes();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira screens and screen schemes:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///screens",
                    mimeType: "application/json",
                    text: JSON.stringify(screens, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///screen-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(schemes, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///issue-type-screen-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(issueTypeSchemes, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide an analysis of the screens and screen schemes, including their relationships and usage patterns."
                }
              }
            ]
          };
        }

        case "analyze_workflows": {
          const workflows = await this.jiraClient.getWorkflows();
          const schemes = await this.jiraClient.getWorkflowSchemes();
          const statuses = await this.jiraClient.getWorkflowStatuses();
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Please analyze the following Jira workflows and related configurations:"
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///workflows",
                    mimeType: "application/json",
                    text: JSON.stringify(workflows, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///workflow-schemes",
                    mimeType: "application/json",
                    text: JSON.stringify(schemes, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "resource",
                  resource: {
                    uri: "jira:///workflow-statuses",
                    mimeType: "application/json",
                    text: JSON.stringify(statuses, null, 2)
                  }
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: "Provide an analysis of the workflows, including status transitions, schemes, and overall process flow."
                }
              }
            ]
          };
        }

        default:
          throw new Error("Unknown prompt");
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const mcp = new JiraCloudMCP();
mcp.start().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
