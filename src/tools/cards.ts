import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlankaClient } from '../planka/client.js';

export function registerCardTools(server: McpServer, client: PlankaClient): void {
  server.registerTool(
    'get_card',
    {
      description: 'Get full details of a card including labels, tasks (checklist), and attachments',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
      },
    },
    async ({ cardId }) => {
      const card = await client.getCard(cardId);
      return {
        content: [{ type: 'text', text: JSON.stringify(card, null, 2) }],
      };
    }
  );

  server.registerTool(
    'create_card',
    {
      description: 'Create a new card in a list',
      inputSchema: {
        listId: z.string().describe('The list ID to create the card in'),
        name: z.string().describe('The card name/title'),
        description: z.string().optional().describe('Card description (supports Markdown)'),
        dueDate: z
          .string()
          .optional()
          .describe('Due date in ISO 8601 format (e.g. 2025-12-31T23:59:00Z)'),
        position: z
          .number()
          .optional()
          .describe('Position of the card in the list (optional, defaults to end)'),
      },
    },
    async ({ listId, name, description, dueDate, position }) => {
      const card = await client.createCard(listId, name, { description, dueDate, position });
      return {
        content: [{ type: 'text', text: JSON.stringify(card, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_card',
    {
      description: 'Update card details such as name, description, due date, or stopwatch',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        name: z.string().optional().describe('New name for the card'),
        description: z.string().optional().describe('New description (supports Markdown)'),
        dueDate: z
          .string()
          .optional()
          .describe('New due date in ISO 8601 format, or empty string to remove'),
        isDueDateCompleted: z.boolean().optional().describe('Mark due date as completed'),
        isSubscribed: z.boolean().optional().describe('Subscribe or unsubscribe from card notifications'),
        stopwatch: z
          .object({
            startedAt: z.string().nullable().describe('ISO 8601 datetime when timer was started, or null to stop'),
            total: z.number().describe('Total elapsed seconds'),
          })
          .optional()
          .describe('Stopwatch state. To start: set startedAt to now and total to 0. To stop: set startedAt to null and total to elapsed seconds.'),
      },
    },
    async ({ cardId, name, description, dueDate, isDueDateCompleted, isSubscribed, stopwatch }) => {
      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (dueDate !== undefined) data.dueDate = dueDate || null;
      if (isDueDateCompleted !== undefined) data.isDueDateCompleted = isDueDateCompleted;
      if (isSubscribed !== undefined) data.isSubscribed = isSubscribed;
      if (stopwatch !== undefined) data.stopwatch = stopwatch;

      const card = await client.updateCard(cardId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(card, null, 2) }],
      };
    }
  );

  server.registerTool(
    'move_card',
    {
      description: 'Move a card to a different list (column), optionally setting its position',
      inputSchema: {
        cardId: z.string().describe('The card ID to move'),
        listId: z.string().describe('The destination list ID'),
        position: z
          .number()
          .optional()
          .describe('Position in the new list (optional, defaults to end)'),
      },
    },
    async ({ cardId, listId, position }) => {
      const card = await client.moveCard(cardId, listId, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(card, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_card',
    {
      description: 'Delete a card permanently',
      inputSchema: {
        cardId: z.string().describe('The card ID to delete'),
      },
    },
    async ({ cardId }) => {
      await client.deleteCard(cardId);
      return {
        content: [{ type: 'text', text: `Card ${cardId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'add_label_to_card',
    {
      description: 'Add an existing label to a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        labelId: z.string().describe('The label ID to add'),
      },
    },
    async ({ cardId, labelId }) => {
      await client.addLabelToCard(cardId, labelId);
      return {
        content: [{ type: 'text', text: `Label ${labelId} added to card ${cardId}` }],
      };
    }
  );

  server.registerTool(
    'remove_label_from_card',
    {
      description: 'Remove a label from a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        labelId: z.string().describe('The label ID to remove'),
      },
    },
    async ({ cardId, labelId }) => {
      await client.removeLabelFromCard(cardId, labelId);
      return {
        content: [{ type: 'text', text: `Label ${labelId} removed from card ${cardId}` }],
      };
    }
  );

  server.registerTool(
    'create_label',
    {
      description: 'Create a new label on a board',
      inputSchema: {
        boardId: z.string().describe('The board ID'),
        name: z.string().describe('Label name'),
        color: z
          .enum([
            'berry-red',
            'pumpkin-orange',
            'lagoon-blue',
            'pink-tulip',
            'light-mud',
            'orange-peel',
            'bright-moss',
            'antique-blue',
            'dark-granite',
            'lagune-blue',
            'sunny-grass',
            'morning-sky',
            'light-orange',
            'midnight-blue',
            'tank-green',
            'gun-metal',
            'wet-moss',
            'red-burgundy',
            'light-concrete',
            'apricot-red',
            'desert-sand',
            'navy-blue',
            'egg-yellow',
            'coral-green',
            'light-cocoa',
          ])
          .describe('Label color'),
      },
    },
    async ({ boardId, name, color }) => {
      const label = await client.createLabel(boardId, name, color);
      return {
        content: [{ type: 'text', text: JSON.stringify(label, null, 2) }],
      };
    }
  );

  server.registerTool(
    'create_task_list',
    {
      description: 'Create a task list (checklist) on a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        name: z.string().describe('Task list name'),
        position: z.number().optional().describe('Position of the task list (optional)'),
      },
    },
    async ({ cardId, name, position }) => {
      const taskList = await client.createTaskList(cardId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(taskList, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_task_list',
    {
      description: 'Update a task list name or position',
      inputSchema: {
        taskListId: z.string().describe('The task list ID'),
        name: z.string().optional().describe('New name for the task list'),
        position: z.number().optional().describe('New position for the task list'),
      },
    },
    async ({ taskListId, name, position }) => {
      const taskList = await client.updateTaskList(taskListId, { name, position });
      return {
        content: [{ type: 'text', text: JSON.stringify(taskList, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_task_list',
    {
      description: 'Delete a task list and all its tasks',
      inputSchema: {
        taskListId: z.string().describe('The task list ID to delete'),
      },
    },
    async ({ taskListId }) => {
      await client.deleteTaskList(taskListId);
      return {
        content: [{ type: 'text', text: `Task list ${taskListId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'create_task',
    {
      description: 'Create a task in a task list on a card',
      inputSchema: {
        taskListId: z.string().describe('The task list ID'),
        name: z.string().describe('Task description'),
        position: z.number().optional().describe('Position of the task (optional)'),
      },
    },
    async ({ taskListId, name, position }) => {
      const task = await client.createTask(taskListId, name, position);
      return {
        content: [{ type: 'text', text: JSON.stringify(task, null, 2) }],
      };
    }
  );

  server.registerTool(
    'update_task',
    {
      description: 'Update a checklist task (rename or mark as completed)',
      inputSchema: {
        taskId: z.string().describe('The task ID'),
        name: z.string().optional().describe('New task name'),
        isCompleted: z.boolean().optional().describe('Mark task as completed or not'),
      },
    },
    async ({ taskId, name, isCompleted }) => {
      const task = await client.updateTask(taskId, { name, isCompleted });
      return {
        content: [{ type: 'text', text: JSON.stringify(task, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_task',
    {
      description: 'Delete a checklist task from a card',
      inputSchema: {
        taskId: z.string().describe('The task ID to delete'),
      },
    },
    async ({ taskId }) => {
      await client.deleteTask(taskId);
      return {
        content: [{ type: 'text', text: `Task ${taskId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'upload_attachment',
    {
      description:
        'Upload a file as an attachment to a card. Provide the file content as a base64-encoded string.',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        filename: z.string().describe('Filename for the attachment (e.g. "report.pdf")'),
        fileContent: z.string().describe('Base64-encoded file content'),
        mimeType: z.string().optional().describe('MIME type (e.g. "text/plain", "application/pdf")'),
      },
    },
    async ({ cardId, filename, fileContent, mimeType }) => {
      const attachment = await client.uploadAttachmentBase64(cardId, fileContent, filename, mimeType);
      return {
        content: [{ type: 'text', text: JSON.stringify(attachment, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_attachment',
    {
      description: 'Delete an attachment from a card',
      inputSchema: {
        attachmentId: z.string().describe('The attachment ID to delete'),
      },
    },
    async ({ attachmentId }) => {
      await client.deleteAttachment(attachmentId);
      return {
        content: [{ type: 'text', text: `Attachment ${attachmentId} deleted successfully` }],
      };
    }
  );

  server.registerTool(
    'add_card_member',
    {
      description: 'Add a user as a member of a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        userId: z.string().describe('The user ID to add'),
      },
    },
    async ({ cardId, userId }) => {
      await client.addCardMember(cardId, userId);
      return {
        content: [{ type: 'text', text: `User ${userId} added to card ${cardId}` }],
      };
    }
  );

  server.registerTool(
    'remove_card_member',
    {
      description: 'Remove a user from a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        userId: z.string().describe('The user ID to remove'),
      },
    },
    async ({ cardId, userId }) => {
      await client.removeCardMember(cardId, userId);
      return {
        content: [{ type: 'text', text: `User ${userId} removed from card ${cardId}` }],
      };
    }
  );

  server.registerTool(
    'get_comments',
    {
      description: 'Get all comments on a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
      },
    },
    async ({ cardId }) => {
      const comments = await client.getComments(cardId);
      return {
        content: [{ type: 'text', text: JSON.stringify(comments, null, 2) }],
      };
    }
  );

  server.registerTool(
    'add_comment',
    {
      description: 'Add a comment to a card',
      inputSchema: {
        cardId: z.string().describe('The card ID'),
        text: z.string().describe('Comment text (supports Markdown)'),
      },
    },
    async ({ cardId, text }) => {
      const comment = await client.addComment(cardId, text);
      return {
        content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }],
      };
    }
  );

  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment from a card',
      inputSchema: {
        commentId: z.string().describe('The comment ID to delete'),
      },
    },
    async ({ commentId }) => {
      await client.deleteComment(commentId);
      return {
        content: [{ type: 'text', text: `Comment ${commentId} deleted successfully` }],
      };
    }
  );
}
