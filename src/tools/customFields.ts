import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlankaClient } from '../planka/client.js';

export function registerCustomFieldTools(server: McpServer, client: PlankaClient): void {
  server.registerTool(
    'create_custom_field_group',
    {
      description: 'Create a custom field group on a board (groups contain one or more custom fields)',
      inputSchema: {
        boardId: z.string().describe('The board ID'),
        name: z.string().describe('Custom field group name'),
        position: z.number().optional().describe('Position of the group (optional)'),
      },
    },
    async ({ boardId, name, position }) => {
      const group = await client.createCustomFieldGroup(boardId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(group, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_custom_field_group',
    {
      description: 'Update a custom field group name or position',
      inputSchema: {
        groupId: z.string().describe('The custom field group ID'),
        name: z.string().optional().describe('New name for the group'),
        position: z.number().optional().describe('New position for the group'),
      },
    },
    async ({ groupId, name, position }) => {
      const group = await client.updateCustomFieldGroup(groupId, { name, position });
      return {
        content: [{ type: 'text', text: JSON.stringify(group, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_custom_field_group',
    {
      description: 'Delete a custom field group and all its fields',
      inputSchema: {
        groupId: z.string().describe('The custom field group ID to delete'),
      },
    },
    async ({ groupId }) => {
      await client.deleteCustomFieldGroup(groupId);
      return {
        content: [{ type: 'text', text: `Custom field group ${groupId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'create_custom_field',
    {
      description: 'Create a custom field inside a custom field group',
      inputSchema: {
        groupId: z.string().describe('The custom field group ID'),
        name: z.string().describe('The field name (e.g. "Story Points", "Sprint")'),
        position: z.number().optional().describe('Position of the field (optional)'),
      },
    },
    async ({ groupId, name, position }) => {
      const field = await client.createCustomField(groupId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(field, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_custom_field',
    {
      description: 'Update a custom field name, position, or whether it shows on the front of the card',
      inputSchema: {
        fieldId: z.string().describe('The custom field ID'),
        name: z.string().optional().describe('New name for the field'),
        position: z.number().optional().describe('New position for the field'),
        showOnFrontOfCard: z.boolean().optional().describe('Whether to show the value on the front of the card'),
      },
    },
    async ({ fieldId, name, position, showOnFrontOfCard }) => {
      const field = await client.updateCustomField(fieldId, { name, position, showOnFrontOfCard });
      return {
        content: [{ type: 'text', text: JSON.stringify(field, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_custom_field',
    {
      description: 'Delete a custom field definition',
      inputSchema: {
        fieldId: z.string().describe('The custom field ID to delete'),
      },
    },
    async ({ fieldId }) => {
      await client.deleteCustomField(fieldId);
      return {
        content: [{ type: 'text', text: `Custom field ${fieldId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'set_custom_field_value',
    {
      description: 'Set or update a custom field value on a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        groupId: z.string().describe('The custom field group ID'),
        fieldId: z.string().describe('The custom field ID'),
        content: z.string().describe('The value to set'),
      },
    },
    async ({ cardId, groupId, fieldId, content }) => {
      const value = await client.setCustomFieldValue(cardId, groupId, fieldId, content);
      return {
        content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_custom_field_value',
    {
      description: 'Remove a custom field value from a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        groupId: z.string().describe('The custom field group ID'),
        fieldId: z.string().describe('The custom field ID'),
      },
    },
    async ({ cardId, groupId, fieldId }) => {
      await client.deleteCustomFieldValue(cardId, groupId, fieldId);
      return {
        content: [{ type: 'text', text: `Custom field value removed from card ${cardId}` }],
      };
    }
  );
}
