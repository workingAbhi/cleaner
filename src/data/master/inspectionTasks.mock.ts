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

  {
    id: 'running-water',

    title: 'Running Water',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Ensure running water is available.',
      'Water should be available 24x7.',
      'Check that the water flow is adequate.',
    ],
  },

  {
    id: 'flush',

    title: 'Flush Working',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Check that the flush is working properly.',
      'Flush should operate without issues.',
      'Check only where a flush is provided.',
    ],
  },

  {
    id: 'illumination',

    title: 'Adequate Illumination',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Ensure adequate lighting inside the washroom.',
      'All required areas should be properly illuminated.',
      'Lighting should be functional.',
    ],
  },

  {
    id: 'door-latch',

    title: 'Functional Door Latch',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Check that the door latch is functional.',
      'Door should close and latch properly.',
      'Ensure the latch is not damaged.',
    ],
  },

  {
    id: 'leak-free-taps',

    title: 'Functional & Leak-Free Taps',

    image: require('../../assets/reference/basin.png'),

    instructions: [
      'Check that all taps are functional.',
      'Ensure there are no visible leaks.',
      'Check that water flow is adequate.',
    ],
  },

  {
    id: 'exhaust-fans',

    title: 'Exhaust Fans',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Check that exhaust fans are available where provided.',
      'Ensure exhaust fans are functional.',
      'Check that there are no visible issues.',
    ],
  },

  {
    id: 'standardised-signage',

    title: 'Standardised Signage',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Check that standardised signage is in place.',
      'Signage should be clearly visible.',
      'Signage should be properly positioned.',
    ],
  },

  {
    id: 'soap',

    title: 'Soap Available',

    image: require('../../assets/reference/basin.png'),

    instructions: [
      'Ensure soap is available.',
      'Soap dispenser should be functional where provided.',
      'Ensure adequate soap is available for users.',
    ],
  },

  {
    id: 'janitor',

    title: 'Janitor on Site',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Ensure the designated janitor is available on site.',
      'Janitor should be available for cleaning activities.',
    ],
  },

  {
    id: 'cleaning-in-progress-board',

    title: '"Cleaning in Progress" Board',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Ensure the "Cleaning in Progress" board is available.',
      'Board should be used during cleaning activities.',
      'Board should be clearly visible to users.',
    ],
  },

  {
    id: 'staff-safety-equipment',

    title: 'Cleaning Staff Safety Equipment',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Check that cleaning staff use gloves and masks.',
      'Ensure clean and appropriate cleaning tools are being used.',
      'Check that forecourt or cleaning staff follow required cleaning practices.',
    ],
  },

  {
    id: 'hygienic-condition',

    title: 'Washroom Hygienic Condition',

    image: require('../../assets/reference/washroom.png'),

    instructions: [
      'Ensure the washroom is maintained in a hygienic condition.',
      'Check that the washroom is clean and presentable.',
      'Washroom should be maintained in hygienic condition at all times.',
    ],
  },

];