export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

export type UserHomeStackParamList = {
  UserHome: undefined;
  Inspection: {
    inspectionItemId?: string;
  } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Reports: undefined;
  Profile: undefined;
};