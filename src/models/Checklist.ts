export interface ChecklistItem {
  id: string;

  title: string;

  checked: boolean;

  remarks?: string;
}

export interface Checklist {
  id: string;

  name: string;

  items: ChecklistItem[];
}