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

type Props =
  NativeStackScreenProps<
    InspectionStackParamList,
    'InspectionUpload'
  >;

const InspectionNavigator = ({
  route,
}: {
  route: {
    params?: {
      inspectionItemId?: string;
    };
  };
}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InspectionUpload"
        component={InspectionUploadScreen}
        initialParams={{
          inspectionItemId:
            route.params?.inspectionItemId,
        }}
        options={{
          title: 'Inspection',
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionNavigator;