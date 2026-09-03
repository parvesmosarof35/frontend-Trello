export type Role = 'OWNER' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
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
  position: number;
  columnId: string;
  creatorId?: string | null;
  creator?: User | null;
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
