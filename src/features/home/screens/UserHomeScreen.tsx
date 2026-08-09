import React, {
  useCallback,
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
  useFocusEffect,
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
  InspectionUploadApi,
} from '../../../core/services/api';

import {
  InspectionImageUpload,
} from '../../../models/InspectionUpload';

import {
  OutletHierarchy,
} from '../../../models';

import {
  SectionHeader,
} from '../components';

import ScreenHeader
  from '../components/ScreenHeader';

import styles
  from './UserHomeScreen.styles';

/**
 * Mock image used when the GET API returns
 * a mock image URL.
 *
 * The actual backend URL does not exist yet,
 * so all returned mock URLs are displayed
 * using this local image.
 */
const MOCK_DISPLAY_IMAGE =
  require(
    '../../../data/mockImageInGET_API_toshowin_userpage.png',
  );

const UserHomeScreen = () => {

  const navigation =
    useNavigation<any>();

  const { user } =
    useAuth();

  const [
    hierarchy,
    setHierarchy,
  ] = useState<
    OutletHierarchy | null
  >(null);

  const [
    uploads,
    setUploads,
  ] = useState<
    InspectionImageUpload[]
  >([]);

  const [
    loadingOutlet,
    setLoadingOutlet,
  ] = useState(false);

  const [
    loadingImages,
    setLoadingImages,
  ] = useState(false);

  /**
   * -----------------------------------------
   * GET outlet details
   * -----------------------------------------
   */
  const loadOutlet =
    async () => {
      if (!user?.roNumber) {
        return;
      }

      try {
        setLoadingOutlet(
          true,
        );

        const result =
          await MasterApi.getOutletHierarchy(
            user.roNumber,
          );

        if (result) {
          setHierarchy(
            result,
          );
        }
      } catch {
        Alert.alert(
          'Outlet',
          'Unable to load outlet details.',
        );
      } finally {
        setLoadingOutlet(
          false,
        );
      }
    };

  /**
   * -----------------------------------------
   * GET inspection images by RO ID
   * -----------------------------------------
   */
  const loadImages =
    async () => {
      if (!user?.roNumber) {
        return;
      }

      try {
        setLoadingImages(
          true,
        );

        /**
         * IMPORTANT:
         *
         * Fetch by RO ID.
         *
         * NOT by user ID.
         */
        const result =
          await InspectionUploadApi.getImagesByRoId(
            user.roNumber,
          );

        setUploads(
          result,
        );
      } catch {
        Alert.alert(
          'Inspection',
          'Unable to load uploaded images.',
        );
      } finally {
        setLoadingImages(
          false,
        );
      }
    };

  /**
   * Load outlet when RO changes.
   */
  useEffect(() => {
    loadOutlet();
  }, [
    user?.roNumber,
  ]);

  /**
   * Load images when RO changes.
   */
  useEffect(() => {
    loadImages();
  }, [
    user?.roNumber,
  ]);

  /**
   * IMPORTANT:
   *
   * When user comes back from the
   * inspection screen, fetch again.
   *
   * This means:
   *
   * Upload
   * ↓
   * Home
   * ↓
   * GET API
   * ↓
   * show latest images
   */
  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [
      user?.roNumber,
    ]),
  );

  const startInspection =
    () => {
      navigation.navigate(
        'Inspection',
      );
    };

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

      <ScreenHeader
        title={
          hierarchy
            ?.outlet.outletName ??
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
          loading={
            loadingOutlet
          }
          onPress={
            startInspection
          }
        />

      </View>

      <View
        style={{
          marginTop: 28,
        }}>

        <SectionHeader
          title="Uploaded Photos"
          subtitle={
            loadingImages
              ? 'Loading photos...'
              : uploads.length > 0
                ? 'Photos uploaded for this RO.'
                : 'No inspection photos uploaded yet.'
          }
        />

        {uploads.map(
          upload => (
            <View
              key={
                upload.id
              }
              style={{
                marginTop:
                  16,

                backgroundColor:
                  '#FFFFFF',

                borderRadius:
                  16,

                padding:
                  12,
              }}>

              <Text
                style={{
                  fontSize:
                    16,

                  fontWeight:
                    '600',

                  marginBottom:
                    10,
                }}>

                {
                  upload.inspectionItem
                }

              </Text>

              {/*
               * IMPORTANT:
               *
               * We intentionally DO NOT
               * display upload.imageUri.
               *
               * The GET API returned
               * upload.link.
               *
               * Since the URL is mocked,
               * map it to our local mock image.
               */}
              <Image
                source={
                  MOCK_DISPLAY_IMAGE
                }
                style={{
                  width:
                    '100%',

                  height:
                    220,

                  borderRadius:
                    12,
                }}
                resizeMode="cover"
              />

              <Text
                style={{
                  marginTop:
                    8,

                  fontSize:
                    12,

                  color:
                    '#777777',
                }}>

                Stored image:
                {' '}
                {
                  upload.link
                }

              </Text>

              <View
                style={{
                  flexDirection:
                    'row',

                  marginTop:
                    12,

                  gap:
                    10,
                }}>

                <View
                  style={{
                    flex:
                      1,
                  }}>

                  <Button
                    title="Update"
                    variant="outline"
                    onPress={() =>
                      navigation.navigate(
                        'Inspection',
                      )
                    }
                  />

                </View>

                <View
                  style={{
                    flex:
                      1,
                  }}>

                  <Button
                    title="Delete"
                    variant="outline"
                    onPress={() => {

                      Alert.alert(
                        'Delete Photo',
                        'Delete this inspection photo?',
                        [
                          {
                            text:
                              'Cancel',

                            style:
                              'cancel',
                          },

                          {
                            text:
                              'Delete',

                            style:
                              'destructive',

                            onPress:
                              async () => {

                                try {

                                  await InspectionUploadApi.deleteImage(
                                    {
                                      roId:
                                        user?.roNumber ??
                                        '',

                                      imageId:
                                        upload.id,

                                      userId:
                                        user?.phoneNumber ??
                                        user?.roNumber,

                                      userName:
                                        user?.name,
                                    },
                                  );

                                  await loadImages();

                                } catch (
                                error
                                ) {

                                  Alert.alert(
                                    'Photo',

                                    error instanceof
                                      Error
                                      ? error.message
                                      : 'Unable to delete photo.',
                                  );
                                }
                              },
                          },
                        ],
                      );
                    }}
                  />

                </View>

              </View>

            </View>
          ),
        )}

      </View>

    </ScrollView>
  );
};

export default UserHomeScreen;