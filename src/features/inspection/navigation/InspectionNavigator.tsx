import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  InspectionUploadScreen,
} from '../screens';

import {
  InspectionStackParamList,
} from './types';

const Stack =
  createNativeStackNavigator<InspectionStackParamList>();

const InspectionNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InspectionUpload"
        component={InspectionUploadScreen}
        options={{
          title: 'Inspection',
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionNavigator;