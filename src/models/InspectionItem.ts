export enum InspectionItemType {
  PHOTO = 'PHOTO',

  BOOLEAN_PHOTO = 'BOOLEAN_PHOTO',

  TEXT = 'TEXT',
}

export interface InspectionItem {
  id: string;

  title: string;

  type: InspectionItemType;

  required: boolean;
}