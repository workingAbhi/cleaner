import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Button,
} from '../../../core/components';

import {
  InspectionTask,
} from '../../../models';

import {
  InspectionTaskApi,
} from '../../../core/services/api';

import {
  InspectionStackParamList,
} from '../navigation';

import {
  ProgressHeader,
} from '../components';

import useInspectionFlow
  from '../hooks/useInspectionFlow';

import styles from './InspectionUploadScreen.styles';

type Props =
  NativeStackScreenProps<
    InspectionStackParamList,
    'InspectionUpload'
  >;

const InspectionUploadScreen = ({
  navigation,
}: Props) => {

  const [
    tasks,
    setTasks,
  ] = useState<InspectionTask[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const result =
        await InspectionTaskApi.getTasks();

      setTasks(result);
    } catch {
      Alert.alert(
        'Inspection',
        'Unable to load inspection tasks.',
        [
          {
            text: 'Go Back',
            onPress: () =>
              navigation.goBack(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const {
    currentTask,
    currentIndex,
    progress,
    isLastStep,
    next,
    previous,
    uploadImage,
  } = useInspectionFlow(tasks);

  const handleUpload = () => {
    Alert.alert(
      'Camera',
      'Camera integration coming next.',
    );

    uploadImage(
      'mock-image',
    );
  };

  const handleNext = () => {
    if (isLastStep) {
      Alert.alert(
        'Inspection',
        'Inspection submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.popToTop(),
          },
        ],
      );

      return;
    }

    next();
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>

        <Text>
          Loading inspection...
        </Text>

      </View>
    );
  }

  if (!tasks.length) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
        }}>

        <Text
          style={{
            textAlign: 'center',
            marginBottom: 20,
          }}>

          No inspection tasks
          are available.

        </Text>

        <Button
          title="Go Back"
          onPress={() =>
            navigation.goBack()
          }
        />

      </View>
    );
  }

  if (!currentTask) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}>

      <ProgressHeader
        current={
          currentIndex + 1
        }
        total={
          tasks.length
        }
        progress={
          progress
        }
      />

      <Text
        style={
          styles.title
        }>

        {currentTask.title}

      </Text>

      {currentTask.image && (
        <Image
          source={
            currentTask.image
          }
          style={
            styles.referenceImage
          }
        />
      )}

      <View
        style={
          styles.instructions
        }>

        {currentTask.instructions.map(
          instruction => (

            <Text
              key={instruction}
              style={
                styles.point
              }>

              • {instruction}

            </Text>

          ),
        )}

      </View>

      <Button
        title="Take Photo"
        onPress={
          handleUpload
        }
      />

      <View
        style={
          styles.footer
        }>

        {currentIndex > 0 ? (
          <Button
            title="Back"
            variant="outline"
            onPress={
              previous
            }
          />
        ) : (
          <Button
            title="Cancel"
            variant="outline"
            onPress={() =>
              navigation.goBack()
            }
          />
        )}

        <Button
          title={
            isLastStep
              ? 'Submit Inspection'
              : 'Next'
          }
          onPress={
            handleNext
          }
        />

      </View>

    </ScrollView>
  );
};

export default InspectionUploadScreen;