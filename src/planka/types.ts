export interface Project {
  id: string;
  name: string;
  background: string | null;
  backgroundImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  position: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string | null;
  color: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | null;
  isDueDateCompleted: boolean;
  position: number;
  boardId: string;
  listId: string;
  creatorUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardDetails extends Card {
  labels: Label[];
  tasks: Task[];
  attachments: Attachment[];
}

export interface TaskList {
  id: string;
  name: string;
  position: number;
  cardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  isCompleted: boolean;
  taskListId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  cardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  cardId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface BoardFull extends Board {
  lists: ListWithCards[];
  labels: Label[];
  members: User[];
}

export interface ListWithCards extends List {
  cards: Card[];
}

export interface CustomFieldGroup {
  id: string;
  name: string;
  position: number;
  boardId: string | null;
  cardId: string | null;
  baseCustomFieldGroupId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomField {
  id: string;
  name: string;
  position: number;
  showOnFrontOfCard: boolean;
  customFieldGroupId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomFieldValue {
  id: string;
  content: string;
  cardId: string;
  customFieldGroupId: string;
  customFieldId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlankaConfig {
  baseUrl: string;
  email: string;
  password: string;
}
