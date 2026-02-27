import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlankaClient } from '../planka/client.js';

export function registerBoardTools(server: McpServer, client: PlankaClient): void {
  server.registerTool(
    'list_boards',
    {
      description: 'List all boards in a project',
      inputSchema: {
        projectId: z.string().describe('The project ID'),
      },
    },
    async ({ projectId }) => {
      const boards = await client.getBoards(projectId);
      return {
        content: [{ type: 'text', text: JSON.stringify(boards, null, 2) }],
      };
    }
  );

  server.registerTool(
    'get_board',
    {
      description:
        'Get full board details including all lists and cards. Use this to get an overview of a complete board.',
      inputSchema: {
        boardId: z.string().describe('The board ID'),
      },
    },
    async ({ boardId }) => {
      const board = await client.getBoard(boardId);
      return {
        content: [{ type: 'text', text: JSON.stringify(board, null, 2) }],
      };
    }
  );

  server.registerTool(
    'create_board',
    {
      description: 'Create a new board inside a project',
      inputSchema: {
        projectId: z.string().describe('The project ID to create the board in'),
        name: z.string().describe('The board name'),
        position: z
          .number()
          .optional()
          .describe('Position of the board (optional, defaults to end)'),
      },
    },
    async ({ projectId, name, position }) => {
      const board = await client.createBoard(projectId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(board, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_board',
    {
      description: 'Update a board name or position',
      inputSchema: {
        boardId: z.string().describe('The board ID'),
        name: z.string().optional().describe('New name for the board'),
        position: z.number().optional().describe('New position for the board'),
      },
    },
    async ({ boardId, name, position }) => {
      const board = await client.updateBoard(boardId, { name, position });
      return {
        content: [{ type: 'text', text: JSON.stringify(board, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_board',
    {
      description: 'Delete a board and all its lists and cards',
      inputSchema: {
        boardId: z.string().describe('The board ID to delete'),
      },
    },
    async ({ boardId }) => {
      await client.deleteBoard(boardId);
      return {
        content: [{ type: 'text', text: `Board ${boardId} deleted successfully` }],
      };
    }
  );
}
