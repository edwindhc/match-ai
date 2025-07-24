import { MultiServerMCPClient } from '@langchain/mcp-adapters'

// Create client and connect to server
export const multiServerMCPClient = new MultiServerMCPClient({
  // Global tool configuration options
  // Whether to throw on errors if a tool fails to load (optional, default: true)
  throwOnLoadError: true,
  // Whether to prefix tool names with the server name (optional, default: true)
  prefixToolNameWithServerName: true,
  // Optional additional prefix for tool names (optional, default: "mcp")
  additionalToolNamePrefix: 'mcp',

  // Server configuration
  mcpServers: {
    'mcp-atlassian': {
      transport: 'stdio',
      command: 'docker',
      args: [
        'run',
        '--rm',
        '-i',
        '-e',
        'JIRA_URL',
        '-e',
        'JIRA_USERNAME',
        '-e',
        'JIRA_API_TOKEN',
        'ghcr.io/sooperset/mcp-atlassian:latest',
      ],
      env: {
        JIRA_URL: process.env.JIRA_URL!,
        JIRA_USERNAME: process.env.JIRA_USERNAME!,
        JIRA_API_TOKEN: process.env.JIRA_API_TOKEN!,
      },
      // Restart configuration for stdio transport
      restart: {
        enabled: true,
        maxAttempts: 3,
        delayMs: 1000,
      },
    },
  },
})
