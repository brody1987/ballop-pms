export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: {
    read: boolean;
    write: boolean;
  };
  avatar?: string;
}

export type ProjectType = 'Sample' | 'Main';
export type ProjectStatus = 'In Progress' | 'On Track' | 'Delayed' | 'Completed' | 'On Hold' | 'Needs Attention';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  owner: 'Donau Sports' | 'GTS' | 'Factory' | 'Shipping';
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  description?: string;
  files: Attachment[];
}

export interface Project {
  id: string;
  name: string;
  orderNumber: string; // e.g., MO-789123
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  team: string[]; // URLs of avatars
  startDate: string;
  dueDate: string;
  isDelayed: boolean;
  hasIssue: boolean;
  steps: WorkflowStep[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'delay' | 'issue' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}