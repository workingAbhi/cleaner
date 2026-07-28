import { Checklist } from './Checklist';
import { Issue } from './Issue';

export interface Inspection {
  id: string;

  outletId: string;

  inspectorId: string;

  date: string;

  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

  score: number;

  checklist: Checklist;

  issues: Issue[];
}