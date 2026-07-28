export interface Task {
  id: string;

  title: string;

  description: string;

  assignedTo: string;

  dueDate: string;

  completed: boolean;
}