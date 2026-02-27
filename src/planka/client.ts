import axios, { AxiosInstance } from 'axios';
import type {
  Project,
  Board,
  BoardFull,
  List,
  Card,
  CardDetails,
  Comment,
  Label,
  TaskList,
  Task,
  Attachment,
  CustomFieldGroup,
  CustomField,
  CustomFieldValue,
} from './types.js';

export class PlankaClient {
  private http: AxiosInstance;
  private token: string | null = null;
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly password: string;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.email = email;
    this.password = password;

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });

    this.http.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 && this.token) {
          this.token = null;
          await this.authenticate();
          err.config.headers['Authorization'] = `Bearer ${this.token}`;
          return this.http.request(err.config);
        }
        throw err;
      }
    );
  }

  async authenticate(): Promise<void> {
    const res = await this.http.post('/api/access-tokens', {
      emailOrUsername: this.email,
      password: this.password,
    });
    this.token = res.data.item;
    this.http.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
  }

  private async ensureAuth(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    await this.ensureAuth();
    const res = await this.http.get('/api/projects');
    return res.data.items;
  }

  async getProject(projectId: string): Promise<Project> {
    await this.ensureAuth();
    const res = await this.http.get(`/api/projects/${projectId}`);
    return res.data.item;
  }

  async createProject(name: string): Promise<Project> {
    await this.ensureAuth();
    const res = await this.http.post('/api/projects', { name, type: 'shared' });
    return res.data.item;
  }

  async updateProject(projectId: string, data: Partial<Pick<Project, 'name'>>): Promise<Project> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/projects/${projectId}`, data);
    return res.data.item;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/projects/${projectId}`);
  }

  // Boards
  async getBoards(projectId: string): Promise<Board[]> {
    await this.ensureAuth();
    const res = await this.http.get(`/api/projects/${projectId}`);
    return res.data.included?.boards ?? [];
  }

  async getBoard(boardId: string): Promise<BoardFull> {
    await this.ensureAuth();
    const res = await this.http.get(`/api/boards/${boardId}`);
    const data = res.data;
    const board: BoardFull = {
      ...data.item,
      lists: [],
      labels: data.included?.labels ?? [],
      members: data.included?.users ?? [],
    };

    const lists: List[] = data.included?.lists ?? [];
    const cards: Card[] = data.included?.cards ?? [];

    board.lists = lists
      .sort((a, b) => a.position - b.position)
      .map((list) => ({
        ...list,
        cards: cards
          .filter((c) => c.listId === list.id)
          .sort((a, b) => a.position - b.position),
      }));

    return board;
  }

  async createBoard(projectId: string, name: string, position?: number): Promise<Board> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/projects/${projectId}/boards`, {
      name,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateBoard(boardId: string, data: Partial<Pick<Board, 'name' | 'position'>>): Promise<Board> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/boards/${boardId}`, data);
    return res.data.item;
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/boards/${boardId}`);
  }

  // Lists
  async createList(boardId: string, name: string, position?: number): Promise<List> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/boards/${boardId}/lists`, {
      name,
      type: 'active',
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateList(listId: string, data: Partial<Pick<List, 'name' | 'position'>>): Promise<List> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/lists/${listId}`, data);
    return res.data.item;
  }

  async deleteList(listId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/lists/${listId}`);
  }

  // Cards
  async getCard(cardId: string): Promise<CardDetails> {
    await this.ensureAuth();
    const res = await this.http.get(`/api/cards/${cardId}`);
    const data = res.data;
    return {
      ...data.item,
      labels: data.included?.cardLabels ?? [],
      tasks: data.included?.tasks ?? [],
      attachments: data.included?.attachments ?? [],
    };
  }

  async createCard(
    listId: string,
    name: string,
    options?: {
      description?: string;
      dueDate?: string;
      position?: number;
      type?: string;
    }
  ): Promise<Card> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/lists/${listId}/cards`, {
      name,
      type: options?.type ?? 'project',
      position: options?.position ?? 65535,
      description: options?.description,
      dueDate: options?.dueDate,
    });
    return res.data.item;
  }

  async updateCard(
    cardId: string,
    data: Partial<Pick<Card, 'name' | 'description' | 'dueDate' | 'isDueDateCompleted' | 'position'>>
  ): Promise<Card> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/cards/${cardId}`, data);
    return res.data.item;
  }

  async moveCard(cardId: string, listId: string, position?: number): Promise<Card> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/cards/${cardId}`, {
      listId,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/cards/${cardId}`);
  }

  // Labels
  async createLabel(boardId: string, name: string, color: string): Promise<Label> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/boards/${boardId}/labels`, { name, color, position: 65535 });
    return res.data.item;
  }

  async addLabelToCard(cardId: string, labelId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.post(`/api/cards/${cardId}/card-labels`, { labelId });
  }

  async removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/cards/${cardId}/card-labels/labelId:${labelId}`);
  }

  // Task Lists
  async createTaskList(cardId: string, name: string, position?: number): Promise<TaskList> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/cards/${cardId}/task-lists`, {
      name,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateTaskList(taskListId: string, data: Partial<Pick<TaskList, 'name' | 'position'>>): Promise<TaskList> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/task-lists/${taskListId}`, data);
    return res.data.item;
  }

  async deleteTaskList(taskListId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/task-lists/${taskListId}`);
  }

  // Tasks
  async createTask(taskListId: string, name: string, position?: number): Promise<Task> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/task-lists/${taskListId}/tasks`, {
      name,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateTask(taskId: string, data: Partial<Pick<Task, 'name' | 'isCompleted'>>): Promise<Task> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/tasks/${taskId}`, data);
    return res.data.item;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/tasks/${taskId}`);
  }

  // Attachments
  async uploadAttachmentBuffer(cardId: string, buffer: Buffer, filename: string, mimeType?: string): Promise<Attachment> {
    await this.ensureAuth();
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: mimeType ?? 'application/octet-stream' });
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('type', 'file');
    form.append('name', filename);
    const res = await fetch(`${this.baseUrl}/api/cards/${cardId}/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: form,
    });
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as { item: Attachment };
    return data.item;
  }

  async uploadAttachmentBase64(cardId: string, base64Content: string, filename: string, mimeType?: string): Promise<Attachment> {
    const buffer = Buffer.from(base64Content, 'base64');
    return this.uploadAttachmentBuffer(cardId, buffer, filename, mimeType);
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/attachments/${attachmentId}`);
  }

  // Comments
  async getComments(cardId: string): Promise<Comment[]> {
    await this.ensureAuth();
    const res = await this.http.get(`/api/cards/${cardId}/comments`);
    return res.data.items;
  }

  async addComment(cardId: string, text: string): Promise<Comment> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/cards/${cardId}/comments`, { text });
    return res.data.item;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/comments/${commentId}`);
  }

  // Card Memberships
  async addCardMember(cardId: string, userId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.post(`/api/cards/${cardId}/card-memberships`, { userId });
  }

  async removeCardMember(cardId: string, userId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/cards/${cardId}/card-memberships/userId:${userId}`);
  }

  // Custom Field Groups
  async createCustomFieldGroup(boardId: string, name: string, position?: number): Promise<CustomFieldGroup> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/boards/${boardId}/custom-field-groups`, {
      name,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateCustomFieldGroup(groupId: string, data: Partial<Pick<CustomFieldGroup, 'name' | 'position'>>): Promise<CustomFieldGroup> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/custom-field-groups/${groupId}`, data);
    return res.data.item;
  }

  async deleteCustomFieldGroup(groupId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/custom-field-groups/${groupId}`);
  }

  // Custom Fields
  async createCustomField(groupId: string, name: string, position?: number): Promise<CustomField> {
    await this.ensureAuth();
    const res = await this.http.post(`/api/custom-field-groups/${groupId}/custom-fields`, {
      name,
      position: position ?? 65535,
    });
    return res.data.item;
  }

  async updateCustomField(fieldId: string, data: Partial<Pick<CustomField, 'name' | 'position' | 'showOnFrontOfCard'>>): Promise<CustomField> {
    await this.ensureAuth();
    const res = await this.http.patch(`/api/custom-fields/${fieldId}`, data);
    return res.data.item;
  }

  async deleteCustomField(fieldId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(`/api/custom-fields/${fieldId}`);
  }

  // Custom Field Values
  async setCustomFieldValue(cardId: string, groupId: string, fieldId: string, content: string): Promise<CustomFieldValue> {
    await this.ensureAuth();
    const res = await this.http.patch(
      `/api/cards/${cardId}/custom-field-values/customFieldGroupId:${groupId}:customFieldId:${fieldId}`,
      { content }
    );
    return res.data.item;
  }

  async deleteCustomFieldValue(cardId: string, groupId: string, fieldId: string): Promise<void> {
    await this.ensureAuth();
    await this.http.delete(
      `/api/cards/${cardId}/custom-field-values/customFieldGroupId:${groupId}:customFieldId:${fieldId}`
    );
  }
}
