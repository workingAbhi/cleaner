import { InspectionItem } from './InspectionItem';

export interface InspectionTemplate {
  id: string;

  title: string;

  items: InspectionItem[];
}