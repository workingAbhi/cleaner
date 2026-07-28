export const Strings = {
  appName: 'Cleaner',

  common: {
    ok: 'OK',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    submit: 'Submit',
    next: 'Next',
    back: 'Back',
    retry: 'Retry',
    loading: 'Loading...',
    search: 'Search',
    logout: 'Logout',
  },

  auth: {
    welcome: 'Welcome Back',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
  },

  home: {
    title: 'Dashboard',
    inspections: 'Inspections',
    tasks: 'Tasks',
    reports: 'Reports',
    profile: 'Profile',
  },

  inspection: {
    start: 'Start Inspection',
    complete: 'Complete Inspection',
    pending: 'Pending',
    completed: 'Completed',
  },

  validation: {
    required: 'This field is required.',
    invalidEmail: 'Please enter a valid email.',
    invalidPhone: 'Please enter a valid phone number.',
  },

  network: {
    offline: 'No internet connection.',
    somethingWentWrong: 'Something went wrong.',
  },
} as const;