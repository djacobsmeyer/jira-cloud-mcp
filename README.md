# Jira Cloud MCP Server

An MCP server that provides deep integration with the Jira Cloud REST API, allowing AI assistants to interact with and analyze your Jira instance.

## Features

### Resources
- List and access Jira issues via `jira://` URIs
- Each resource includes issue metadata and content
- JSON format for rich data access

### Tools

#### Issue Management
- `search_issues` - Search Jira issues using JQL
- `create_issue` - Create new Jira issues

#### Configuration Tools
- Permission Management
  - `get_permission_schemes` - Get all permission schemes
  
- Priority Management
  - `get_priorities` - Get all priorities
  
- Notification Management
  - `get_notification_schemes` - Get all notification schemes
  
- Security Management
  - `get_security_schemes` - Get all security schemes
  - `get_security_levels` - Get security levels for a specific scheme
  
- Field Management
  - `get_field_configurations` - Get all field configurations
  - `get_field_configuration_schemes` - Get all field configuration schemes
  
- Screen Management
  - `get_screens` - Get all screens
  - `get_screen_schemes` - Get all screen schemes
  - `get_issue_type_screen_schemes` - Get all issue type screen schemes
  
- Workflow Management
  - `get_workflows` - Get all workflows
  - `get_workflow_schemes` - Get all workflow schemes
  - `get_workflow_statuses` - Get all workflow statuses
  - `get_workflow_transitions` - Get transitions for a specific workflow

### Analysis Prompts
- `summarize_issues` - Summarize Jira issues
- `analyze_permission_schemes` - Analyze permission configurations
- `analyze_priorities` - Analyze priority levels
- `analyze_notification_schemes` - Analyze notification configurations
- `analyze_security_schemes` - Analyze security settings
- `analyze_field_configurations` - Analyze field configurations
- `analyze_screens` - Analyze screens and screen schemes
- `analyze_workflows` - Analyze workflows and related configurations

## Setup

### Prerequisites
- Node.js v16 or higher
- A Jira Cloud instance
- Jira API token (generate from Atlassian account settings)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jira-cloud-mcp.git
cd jira-cloud-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

### Integration with Claude Desktop

Configure the server in your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jira-cloud-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/jira-cloud-mcp/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "your-api-token",
        "JIRA_EMAIL": "your-jira-email",
        "JIRA_DOMAIN": "your-domain.atlassian.net"
      }
    }
  }
}
```

Required environment variables:
- `JIRA_API_TOKEN`: Your Jira API token (generate from Atlassian account settings)
- `JIRA_EMAIL`: Your Jira account email
- `JIRA_DOMAIN`: Your Jira domain (e.g., "your-company.atlassian.net")

### Development

For development with auto-rebuild:
```bash
npm run watch
```

### Debugging

The server includes the MCP Inspector for debugging:
```bash
npm run inspector
```

This will provide a URL to access the debugging interface in your browser.

## Usage Examples

1. Search for issues:
```
Use the search_issues tool with JQL: project = "PROJ" ORDER BY created DESC
```

2. Create an issue:
```
Use the create_issue tool with:
- project: PROJ
- summary: New feature request
- description: Implement new functionality
```

3. Analyze workflows:
```
Use the analyze_workflows prompt to get a detailed analysis of your Jira workflows
```

4. Examine security:
```
Use the analyze_security_schemes prompt to review your Jira security configuration
```

## Error Handling

The server includes comprehensive error handling for:
- Missing environment variables
- Invalid API credentials
- Failed API requests
- Invalid tool parameters

Error messages are descriptive and include troubleshooting guidance.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
