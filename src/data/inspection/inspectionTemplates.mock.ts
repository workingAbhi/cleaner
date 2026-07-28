import {
  InspectionItemType,
  InspectionTemplate,
} from '../../models';

export const inspectionTemplates: InspectionTemplate[] = [
  {
    id: 'DAILY',

    title: 'Daily Inspection',

    items: [
      {
        id: 'PHOTO',

        title: 'Outlet Photo',

        type: InspectionItemType.PHOTO,

        required: true,
      },

      {
        id: 'RUNNING_WATER',

        title: 'Running Water',

        type: InspectionItemType.BOOLEAN_PHOTO,

        required: true,
      },

      {
        id: 'FLUSH',

        title: 'Flush Working',

        type: InspectionItemType.BOOLEAN_PHOTO,

        required: true,
      },

      {
        id: 'RESTROOM',

        title: 'Restroom Hygiene',

        type: InspectionItemType.BOOLEAN_PHOTO,

        required: true,
      },
    ],
  },
];