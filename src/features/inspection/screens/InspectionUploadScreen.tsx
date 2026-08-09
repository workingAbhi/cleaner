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
          await InspectionTaskApi
            .getTasks();

        setTasks(
          result,
        );

      } catch {

        Alert.alert(
          'Inspection',
          'Unable to load inspection tasks.',
          [
            {
              text: 'Go Back',
              onPress:
                () =>
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
      images[
        currentTask.id
      ],
    );

  }, [
    currentTask,
    images,
  ]);

  //-------------------------------------

  const openCamera =
    async () => {

      const options:
        CameraOptions = {
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

      setCapturedImage(
        uri,
      );
    };

  //-------------------------------------

  const retakePhoto =
    () => {

      if (saving) {
        return;
      }

      setCapturedImage(
        undefined,
      );

      openCamera();
    };

  //-------------------------------------

  const confirmPhoto =
    async () => {

      if (
        !capturedImage ||
        saving
      ) {
        return;
      }

      const success =
        await uploadImage(

          capturedImage,

          user?.phoneNumber ??
            user?.roNumber,

          user?.name,

        );

      if (!success) {

        Alert.alert(
          'Upload',
          'Unable to save the image. Please try again.',
        );

        return;
      }

      if (isLastStep) {

        Alert.alert(
          'Inspection Complete',
          'All inspection photos have been uploaded successfully.',
          [
            {
              text: 'Done',

              onPress:
                () =>
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

  const skipInspection =
    () => {

      if (saving) {
        return;
      }

      setCapturedImage(
        undefined,
      );

      if (isLastStep) {

        navigation.popToTop();

        return;
      }

      next();
    };

  //-------------------------------------

  const handleBack =
    () => {

      if (saving) {
        return;
      }

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
        style={
          styles.loadingContainer
        }>

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
        style={
          styles.emptyContainer
        }>

        <Text
          style={
            styles.emptyText
          }>

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
              key={
                instruction
              }
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
          style={
            styles.capturedImageContainer
          }>

          <Image
            source={{
              uri:
                capturedImage,
            }}
            style={
              styles.capturedImage
            }
            resizeMode="cover"
          />

          <View
            style={
              styles.imageActions
            }>

            <TouchableOpacity
              onPress={
                retakePhoto
              }
              disabled={
                saving
              }
              style={
                styles.retakeButton
              }>

              <Text
                style={
                  styles.imageActionText
                }>

                ×

              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                confirmPhoto
              }
              disabled={
                saving
              }
              style={
                styles.confirmButton
              }>

              <Text
                style={
                  styles.imageActionText
                }>

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
          disabled={
            saving
          }
        />

      )}

      {/* ---------------------------------
          BOTTOM ACTIONS
          --------------------------------- */}

      <View
        style={
          styles.footer
        }>

        <View
          style={
            styles.footerButton
          }>

          <Button
            title={
              currentIndex > 0
                ? 'Back'
                : 'Cancel'
            }
            variant="outline"
            onPress={
              handleBack
            }
            disabled={
              saving
            }
          />

        </View>

        {!capturedImage && (

          <View
            style={
              styles.footerButton
            }>

            <Button
              title="Skip"
              variant="outline"
              onPress={
                skipInspection
              }
              disabled={
                saving
              }
            />

          </View>

        )}

        {capturedImage &&
          !isLastStep && (

            <View
              style={
                styles.footerButton
              }>

              <Button
                title="Confirm ✓"
                onPress={
                  confirmPhoto
                }
                loading={
                  saving
                }
              />

            </View>

          )}

        {capturedImage &&
          isLastStep && (

            <View
              style={
                styles.footerButton
              }>

              <Button
                title="Complete"
                onPress={
                  confirmPhoto
                }
                loading={
                  saving
                }
              />

            </View>

          )}

      </View>

    </ScrollView>
  );
};

export default InspectionUploadScreen;