import { InspectionTask } from '../../models';

export const InspectionTasks: InspectionTask[] = [

  {

    id: 'washroom',

    title: 'Washroom',

    image: require('../../assets/reference/washroom.png'),

    instructions: [

      'Capture the complete washroom.',

      'Ensure good lighting.',

      'Floor must be visible.',

      'Toilet seat should be visible.',

    ],

  },

  {

    id: 'basin',

    title: 'Wash Basin',

    image: require('../../assets/reference/basin.png'),

    instructions: [

      'Capture entire basin.',

      'Mirror should be visible.',

      'Tap should be visible.',

    ],

  },

  {

    id: 'mirror',

    title: 'Mirror',

    image: require('../../assets/reference/mirror.png'),

    instructions: [

      'Capture entire mirror.',

      'No reflections blocking view.',

    ],

  },

  {

    id: 'dustbin',

    title: 'Dustbin',

    image: require('../../assets/reference/dustbin.png'),

    instructions: [

      'Dustbin should be visible.',

      'Surrounding area should be visible.',

    ],

  },

];