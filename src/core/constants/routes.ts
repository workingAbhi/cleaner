export const Routes = {
  // Auth
  Splash: 'Splash',
  Login: 'Login',

  // Main Tabs
  Home: 'Home',
  Dashboard: 'Dashboard',
  Tasks: 'Tasks',
  Inspections: 'Inspections',
  Reports: 'Reports',
  Profile: 'Profile',

  // Additional Screens
  OutletDetails: 'OutletDetails',
  InspectionDetails: 'InspectionDetails',
  Checklist: 'Checklist',
  Settings: 'Settings',

  // Navigation Containers
  AuthNavigator: 'AuthNavigator',
  MainNavigator: 'MainNavigator',
} as const;

export type RouteName = typeof Routes[keyof typeof Routes];