export type Role = 'OWNER' | 'MEMBER' | 'VIEWER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: Role;
  user: User;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  priority: Priority;
  dueDate?: string | null;
  labels: string[];
  position: number;
  columnId: string;
  creatorId?: string | null;
  creator?: User | null;
  subtasks?: Subtask[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: User;
  members?: BoardMember[];
  columns?: Column[];
  isOwner?: boolean;
  _count?: {
    columns: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}
