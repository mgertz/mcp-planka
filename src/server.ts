import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PlankaClient } from './planka/client.js';
import { registerProjectTools } from './tools/projects.js';
import { registerBoardTools } from './tools/boards.js';
import { registerListTools } from './tools/lists.js';
import { registerCardTools } from './tools/cards.js';
import { registerCustomFieldTools } from './tools/customFields.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')) as { version: string };

export function createMcpServer(client: PlankaClient): McpServer {
  const server = new McpServer({
    name: 'mcp-planka',
    version,
  });

  registerProjectTools(server, client);
  registerBoardTools(server, client);
  registerListTools(server, client);
  registerCardTools(server, client);
  registerCustomFieldTools(server, client);

  return server;
}
