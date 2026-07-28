import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  ScrollView,
} from 'react-native';

import { Button } from '../../../core/components';

import { useAuth } from '../../../core/context';

import { InspectionApi } from '../../../core/services/api';

import { SectionHeader } from '../components';

import { InspectionItemCard } from '../../inspection/components';

import ScreenHeader from '../components/ScreenHeader';

import {
  InspectionSubmissionItem,
  InspectionTemplate,
} from '../../../models';

import styles from './UserHomeScreen.styles';

const UserHomeScreen = () => {
  const { user } = useAuth();

  const [template, setTemplate] =
    useState<InspectionTemplate>();

  const [responses, setResponses] =
    useState<
      Record<
        string,
        InspectionSubmissionItem
      >
    >({});

  useEffect(() => {
    loadInspection();
  }, []);

  const loadInspection =
    async () => {
      const inspection =
        await InspectionApi.getDailyInspection();

      setTemplate(inspection);
    };

  const updateItem = (
    id: string,
    values: Partial<InspectionSubmissionItem>,
  ) => {
    setResponses(previous => ({
      ...previous,

      [id]: {
        ...previous[id],
        itemId: id,
        ...values,
      },
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <ScreenHeader
        title={`Good Morning, ${user?.name ?? ''}`}
        subtitle={
          user?.roNumber ??
          'Outlet'
        }
      />

      <SectionHeader
        title="Today's Inspection"
        subtitle="Complete today's mandatory checklist."
      />

      {template?.items.map(item => (
        <InspectionItemCard
          key={item.id}
          item={item}
          imageUri={
            responses[item.id]
              ?.imageUri
          }
          onUpload={() =>
            Alert.alert(
              'Upload',
              'Camera/Image Picker coming next.',
            )
          }
        />
      ))}

      <Button
        title="Submit Inspection"
        onPress={() =>
          Alert.alert(
            'Inspection',
            'Submission API will be connected later.',
          )
        }
      />
    </ScrollView>
  );
};

export default UserHomeScreen;