import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlankaClient } from '../planka/client.js';

export function registerListTools(server: McpServer, client: PlankaClient): void {
  server.registerTool(
    'create_list',
    {
      description: 'Create a new list (column) in a board',
      inputSchema: {
        boardId: z.string().describe('The board ID to create the list in'),
        name: z.string().describe('The list name'),
        position: z
          .number()
          .optional()
          .describe('Position of the list (optional, defaults to end)'),
      },
    },
    async ({ boardId, name, position }) => {
      const list = await client.createList(boardId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_list',
    {
      description: 'Update a list name or position',
      inputSchema: {
        listId: z.string().describe('The list ID'),
        name: z.string().optional().describe('New name for the list'),
        position: z.number().optional().describe('New position for the list'),
      },
    },
    async ({ listId, name, position }) => {
      const list = await client.updateList(listId, { name, position });
      return {
        content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_list',
    {
      description: 'Delete a list and all its cards',
      inputSchema: {
        listId: z.string().describe('The list ID to delete'),
      },
    },
    async ({ listId }) => {
      await client.deleteList(listId);
      return {
        content: [{ type: 'text', text: `List ${listId} deleted successfully` }],
      };
    }
  );
}
