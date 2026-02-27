import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlankaClient } from '../planka/client.js';

export function registerProjectTools(server: McpServer, client: PlankaClient): void {
  server.registerTool(
    'list_projects',
    {
      description: 'List all projects in Planka',
      inputSchema: {},
    },
    async () => {
      const projects = await client.getProjects();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'get_project',
    {
      description: 'Get details of a specific project',
      inputSchema: {
        projectId: z.string().describe('The project ID'),
      },
    },
    async ({ projectId }) => {
      const project = await client.getProject(projectId);
      return {
        content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
      };
    }
  );

  server.registerTool(
    'create_project',
    {
      description: 'Create a new project in Planka',
      inputSchema: {
        name: z.string().describe('The project name'),
      },
    },
    async ({ name }) => {
      const project = await client.createProject(name);
      return {
        content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_project',
    {
      description: 'Update an existing project',
      inputSchema: {
        projectId: z.string().describe('The project ID'),
        name: z.string().describe('New name for the project'),
      },
    },
    async ({ projectId, name }) => {
      const project = await client.updateProject(projectId, { name });
      return {
        content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_project',
    {
      description: 'Delete a project permanently. IMPORTANT: The project must have no boards — delete all boards first using delete_board, otherwise this will fail with a 422 error.',
      inputSchema: {
        projectId: z.string().describe('The project ID to delete'),
      },
    },
    async ({ projectId }) => {
      await client.deleteProject(projectId);
      return {
        content: [{ type: 'text', text: `Project ${projectId} deleted successfully` }],
      };
    }
  );
}
