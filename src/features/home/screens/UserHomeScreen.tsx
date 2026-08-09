import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  ScrollView,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  Button,
} from '../../../core/components';

import {
  useAuth,
} from '../../../core/context';

import {
  MasterApi,
} from '../../../core/services/api';

import {
  OutletHierarchy,
} from '../../../models';

import {
  SectionHeader,
} from '../components';

import ScreenHeader from '../components/ScreenHeader';

import styles from './UserHomeScreen.styles';

const UserHomeScreen = () => {

  const navigation =
    useNavigation<any>();

  const { user } =
    useAuth();

  const [
    hierarchy,
    setHierarchy,
  ] = useState<OutletHierarchy | null>(
    null,
  );

  const [
    loadingOutlet,
    setLoadingOutlet,
  ] = useState(false);

  const loadOutlet = async () => {

    if (!user?.roNumber) {
      return;
    }

    try {

      setLoadingOutlet(true);

      const result =
        await MasterApi.getOutletHierarchy(
          user.roNumber,
        );

      if (result) {
        setHierarchy(result);
      }

    } catch {

      Alert.alert(
        'Outlet',
        'Unable to load outlet details.',
      );

    } finally {

      setLoadingOutlet(false);

    }
  };

  useEffect(() => {
    loadOutlet();
  }, [user?.roNumber]);

  const startInspection = () => {

    navigation.navigate(
      'Inspection',
    );

  };

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}>

      <ScreenHeader
        title={
          hierarchy?.outlet.outletName ??
          user?.roNumber ??
          'Outlet'
        }
        subtitle="Daily Inspection"
      />

      <SectionHeader
        title="Today's Inspection"
        subtitle="Complete each inspection task one by one."
      />

      <View
        style={{
          marginTop: 16,
        }}>

        <Button
          title={
            loadingOutlet
              ? 'Loading...'
              : 'Start Inspection'
          }
          loading={loadingOutlet}
          onPress={
            startInspection
          }
        />

      </View>

    </ScrollView>
  );
};

export default UserHomeScreen;