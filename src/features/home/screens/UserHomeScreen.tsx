import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  ScrollView,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  Button,
} from '../../../core/components';

import {
  useAuth,
} from '../../../core/context';

import {
  isSupabaseConfigured,
} from '../../../core/config/appConfig';

import {
  MasterApi,
  InspectionUploadApi,
  InspectionAnalysisApi,
} from '../../../core/services/api';

import {
  UserHomeStackParamList,
} from '../../../core/navigation/types';

import {
  InspectionImageUpload,
} from '../../../models/InspectionUpload';

import {
  AiAnalysis,
  OutletHierarchy,
} from '../../../models';

import {
  InspectionPhotoCard,
} from '../../inspection/components';

import {
  InspectionPhotoCardSkeleton,
  SectionHeader,
} from '../components';

import ScreenHeader
  from '../components/ScreenHeader';

import styles
  from './UserHomeScreen.styles';

const UserHomeScreen = () => {

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        UserHomeStackParamList,
        'UserHome'
      >
    >();

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
    analyses,
    setAnalyses,
  ] = useState<
    Record<string, AiAnalysis>
  >({});

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
    async (
      showLoader = true,
    ) => {
      if (!user?.roNumber) {
        return;
      }

      try {
        if (showLoader) {
          setLoadingImages(
            true,
          );
        }

        const result =
          await InspectionUploadApi.getImagesByRoId(
            user.roNumber,
          );

        const latest =
          await InspectionAnalysisApi.getLatestByRoId(
            user.roNumber,
          );

        setUploads(
          result,
        );

        setAnalyses(
          latest,
        );
      } catch {
        Alert.alert(
          'Inspection',
          'Unable to load uploaded images.',
        );
      } finally {
        if (showLoader) {
          setLoadingImages(
            false,
          );
        }
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

  useFocusEffect(
    useCallback(() => {
      loadImages(true);

      if (!isSupabaseConfigured()) {
        return;
      }

      const timer = setInterval(() => {
        loadImages(false);
      }, 4000);

      return () => {
        clearInterval(timer);
      };
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
            uploads.length > 0
              ? 'Photos uploaded for this RO.'
              : loadingImages
                ? 'Fetching photos...'
                : 'No inspection photos uploaded yet.'
          }
        />

        {loadingImages && uploads.length === 0 && (
          <>
            <InspectionPhotoCardSkeleton />
            <InspectionPhotoCardSkeleton />
            <InspectionPhotoCardSkeleton />
          </>
        )}

        {uploads.map(
          upload => (
            <InspectionPhotoCard
              key={upload.id}
              upload={upload}
              analysis={analyses[upload.id]}>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                  gap: 10,
                }}>

                <View style={{ flex: 1 }}>
                  <Button
                    title="Update"
                    variant="outline"
                    onPress={() =>
                      navigation.navigate(
                        'Inspection',
                        {
                          inspectionItemId:
                            upload.inspectionItem,
                        },
                      )
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Button
                    title="Delete"
                    variant="outline"
                    onPress={() => {
                      Alert.alert(
                        'Delete Photo',
                        'Delete this inspection photo?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await InspectionUploadApi.deleteImage({
                                  roId: user?.roNumber ?? '',
                                  imageId: upload.id,
                                  userId:
                                    user?.phoneNumber ??
                                    user?.roNumber,
                                  userName: user?.name,
                                });

                                await loadImages();
                              } catch (error) {
                                Alert.alert(
                                  'Photo',
                                  error instanceof Error
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
            </InspectionPhotoCard>
          ),
        )}

      </View>

    </ScrollView>
  );
};

export default UserHomeScreen;