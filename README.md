# mcp-planka

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes [Planka](https://planka.app) kanban board operations as tools — letting AI assistants like Claude manage your boards directly.

## Features

Full coverage of the Planka API:

- **Projects** — list, get, create, update, delete
- **Boards** — list, get, create, update, delete
- **Lists** — create, update, delete
- **Cards** — get, create, update, move, delete
- **Labels** — create, add to card, remove from card
- **Task lists & tasks** — full checklist support with completion tracking
- **Comments** — get, add, delete
- **Attachments** — upload (base64), delete
- **Card members** — add, remove
- **Stopwatch** — start/stop time tracking on cards
- **Custom fields** — groups, fields and values
- **Subscribe** — subscribe/unsubscribe to card notifications

## Quick start

### Prerequisites

- Docker and Docker Compose
- A running [Planka](https://github.com/plankanban/planka) instance

### 1. Configure

```bash
cp .env.example .env
```

Edit `.env` with your Planka credentials:

```env
PLANKA_URL=https://your-planka-instance.example.com
PLANKA_EMAIL=your@email.com
PLANKA_PASSWORD=yourpassword

# External port (container always runs on 25478 internally)
PORT=25478
```

### 2. Start

```bash
docker compose up -d
```

### 3. Connect to Claude Code

```bash
claude mcp add planka --transport http http://localhost:25478/mcp
```

That's it — Claude can now manage your Planka boards.

## Docker images

Pre-built images are available from both registries:

```bash
# GitHub Container Registry
docker pull ghcr.io/mgertz/mcp-planka:latest

# Docker Hub
docker pull mgertz/mcp-planka:latest
```

### Version tags

| Tag | Description |
|---|---|
| `latest` | Latest stable release |
| `1` | Latest patch in major version 1 |
| `1.2` | Latest patch in version 1.2 |
| `1.2.3` | Exact version |

## Available tools

### Projects
| Tool | Description |
|---|---|
| `list_projects` | List all projects |
| `get_project` | Get project details |
| `create_project` | Create a new project |
| `update_project` | Rename a project |
| `delete_project` | Delete a project (all boards must be deleted first) |

### Boards
| Tool | Description |
|---|---|
| `list_boards` | List all boards in a project |
| `get_board` | Get full board with lists and cards |
| `create_board` | Create a new board |
| `update_board` | Rename or reposition a board |
| `delete_board` | Delete a board and all its contents |

### Lists
| Tool | Description |
|---|---|
| `create_list` | Create a new list (column) |
| `update_list` | Rename or reposition a list |
| `delete_list` | Delete a list and all its cards |

### Cards
| Tool | Description |
|---|---|
| `get_card` | Get full card details including labels, tasks and attachments |
| `create_card` | Create a new card |
| `update_card` | Update name, description, due date, stopwatch or subscription |
| `move_card` | Move a card to a different list |
| `delete_card` | Delete a card permanently |

### Labels
| Tool | Description |
|---|---|
| `create_label` | Create a label on a board |
| `add_label_to_card` | Add an existing label to a card |
| `remove_label_from_card` | Remove a label from a card |

### Task lists & tasks
| Tool | Description |
|---|---|
| `create_task_list` | Create a checklist on a card |
| `update_task_list` | Rename or reposition a task list |
| `delete_task_list` | Delete a task list and all its tasks |
| `create_task` | Add a task to a task list |
| `update_task` | Rename a task or mark it as completed |
| `delete_task` | Delete a task |

### Comments
| Tool | Description |
|---|---|
| `get_comments` | Get all comments on a card |
| `add_comment` | Add a comment to a card |
| `delete_comment` | Delete a comment |

### Attachments
| Tool | Description |
|---|---|
| `upload_attachment` | Upload a file to a card (base64-encoded content) |
| `delete_attachment` | Delete an attachment |

### Members
| Tool | Description |
|---|---|
| `add_card_member` | Add a user as a member of a card |
| `remove_card_member` | Remove a user from a card |

### Custom fields
| Tool | Description |
|---|---|
| `create_custom_field_group` | Create a custom field group on a board |
| `update_custom_field_group` | Rename or reposition a custom field group |
| `delete_custom_field_group` | Delete a custom field group and all its fields |
| `create_custom_field` | Create a custom field in a group |
| `update_custom_field` | Rename, reposition or toggle front-of-card display |
| `delete_custom_field` | Delete a custom field |
| `set_custom_field_value` | Set a custom field value on a card |
| `delete_custom_field_value` | Remove a custom field value from a card |

## Local development

```bash
npm install
npm run dev       # Run with tsx (no build needed)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled output
```

## Contributing

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org) format, as releases and versioning are automated via [semantic-release](https://semantic-release.gitbook.io):

```
feat: add new tool for X
fix: correct endpoint for Y
chore: update dependencies
```

PRs are validated automatically to ensure the title follows this format.

## License

MIT
