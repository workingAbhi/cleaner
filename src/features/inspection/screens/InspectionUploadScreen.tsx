import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  launchCamera,
  CameraOptions,
} from 'react-native-image-picker';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Button,
} from '../../../core/components';

import {
  useAuth,
} from '../../../core/context';

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

  const { user } =
    useAuth();

  const [
    tasks,
    setTasks,
  ] = useState<
    InspectionTask[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    capturedImage,
    setCapturedImage,
  ] = useState<
    string | undefined
  >(undefined);

  //-------------------------------------

  useEffect(() => {
    loadTasks();
  }, []);

  //-------------------------------------

  const loadTasks =
    async () => {

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

  //-------------------------------------

  const {
    currentTask,

    currentIndex,

    progress,

    isLastStep,

    next,

    previous,

    uploadImage,

    saving,

    images,

  } =
    useInspectionFlow(
      tasks,
      user?.roNumber,
    );

  //-------------------------------------

  useEffect(() => {

    if (!currentTask) {
      return;
    }

    setCapturedImage(
      images[currentTask.id],
    );

  }, [
    currentTask,
    images,
  ]);

  //-------------------------------------

  const openCamera =
    async () => {

      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: false,
      };

      const result =
        await launchCamera(
          options,
        );

      if (
        result.didCancel
      ) {
        return;
      }

      if (
        result.errorCode
      ) {

        Alert.alert(
          'Camera',
          result.errorMessage ??
            'Unable to open camera.',
        );

        return;
      }

      const uri =
        result.assets?.[0]?.uri;

      if (!uri) {

        Alert.alert(
          'Camera',
          'No image was captured.',
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * We only store the captured
       * image in temporary screen
       * state here.
       *
       * It is NOT uploaded yet.
       *
       * The user must press ✓.
       */
      setCapturedImage(uri);
    };

  //-------------------------------------

  const retakePhoto =
    () => {

      setCapturedImage(
        undefined,
      );

      openCamera();
    };

  //-------------------------------------

  const confirmPhoto =
    async () => {

      if (
        !capturedImage
      ) {
        return;
      }

      const success =
        await uploadImage(
          capturedImage,
        );

      if (!success) {

        Alert.alert(
          'Upload',
          'Unable to save the image.',
        );

        return;
      }

      /*
       * After confirmation,
       * move to the next inspection
       * item.
       */
      if (isLastStep) {

        Alert.alert(
          'Inspection',
          'All inspection photos have been saved.',
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

      setCapturedImage(
        undefined,
      );

      next();
    };

  //-------------------------------------

  const handleBack =
    () => {

      if (
        capturedImage
      ) {

        setCapturedImage(
          undefined,
        );

        return;
      }

      if (
        currentIndex > 0
      ) {

        previous();

        return;
      }

      navigation.goBack();
    };

  //-------------------------------------

  if (loading) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          alignItems:
            'center',
        }}>

        <Text>
          Loading inspection...
        </Text>

      </View>
    );
  }

  //-------------------------------------

  if (!tasks.length) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          padding: 24,
        }}>

        <Text
          style={{
            textAlign:
              'center',
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

  //-------------------------------------

  if (!currentTask) {
    return null;
  }

  //-------------------------------------

  return (

    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }>

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

      {capturedImage ? (

        <View
          style={{
            position:
              'relative',
          }}>

          <Image
            source={{
              uri:
                capturedImage,
            }}
            style={{
              width: '100%',
              height: 320,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />

          <View
            style={{
              position:
                'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection:
                'row',
              justifyContent:
                'center',
              gap: 24,
            }}>

            <TouchableOpacity
              onPress={
                retakePhoto
              }
              disabled={saving}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor:
                  '#EF4444',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}>

              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 32,
                  lineHeight: 34,
                  fontWeight: '600',
                }}>

                ×

              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                confirmPhoto
              }
              disabled={saving}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor:
                  '#22C55E',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}>

              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 30,
                  lineHeight: 34,
                  fontWeight: '700',
                }}>

                ✓

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      ) : (

        <Button
          title="Take Photo"
          onPress={
            openCamera
          }
        />

      )}

      <View
        style={
          styles.footer
        }>

        <Button
          title="Back"
          variant="outline"
          onPress={
            handleBack
          }
          disabled={
            saving
          }
        />

        {!capturedImage && (
          <Button
            title="Cancel"
            variant="outline"
            onPress={() =>
              navigation.goBack()
            }
            disabled={
              saving
            }
          />
        )}

      </View>

    </ScrollView>
  );
};

export default InspectionUploadScreen;