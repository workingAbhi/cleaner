import React from 'react';

import {
  Image,
  Text,
  View,
} from 'react-native';

import {
  AiAnalysis,
} from '../../../models/AiAnalysis';

import {
  InspectionImageUpload,
} from '../../../models/InspectionUpload';

import {
  Colors,
} from '../../../core/theme';

const MOCK_DISPLAY_IMAGE = require('../../../data/mockImageInGET_API_toshowin_userpage.png');

type Props = {
  upload: InspectionImageUpload;
  analysis?: AiAnalysis;
  outletLabel?: string;
  children?: React.ReactNode;
};

export const inspectionImageSource = (link: string) =>
  /^https:\/\/image\d+\.png$/i.test(link)
    ? MOCK_DISPLAY_IMAGE
    : { uri: link };

const statusText = (analysis?: AiAnalysis) => {
  if (!analysis || analysis.status === 'PROCESSING') {
    return 'Under analysis';
  }

  if (analysis.status === 'FAILED') {
    return analysis.analysisJson.error ??
      'AI Analysis: Failed. Add GEMINI_API_KEY and recapture.';
  }

  const score = analysis.score ?? analysis.analysisJson.score;
  const passFail = analysis.analysisJson.status;
  const confidence = analysis.confidence ?? analysis.analysisJson.confidence;

  const parts = [
    score != null ? `Score: ${score}/100` : null,
    passFail,
    confidence != null
      ? `Confidence: ${Math.round(confidence * 100)}%`
      : null,
  ].filter(Boolean);

  return parts.join('  ·  ') || 'Analysis complete';
};

const InspectionPhotoCard = ({
  upload,
  analysis,
  outletLabel,
  children,
}: Props) => {
  const issues = analysis?.analysisJson.issues ?? [];
  const failed = analysis?.status === 'FAILED';
  const completed = analysis?.status === 'COMPLETED';

  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 12,
      }}>
      {outletLabel ? (
        <Text
          style={{
            fontSize: 13,
            color: Colors.textSecondary,
            marginBottom: 4,
          }}>
          {outletLabel}
        </Text>
      ) : null}

      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: Colors.text,
          marginBottom: 10,
        }}>
        {upload.inspectionItem}
      </Text>

      <Image
        source={inspectionImageSource(upload.link)}
        style={{
          width: '100%',
          height: 220,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />

      <Text
        style={{
          marginTop: 10,
          fontSize: 14,
          fontWeight: '600',
          color: failed
            ? Colors.error
            : completed
              ? Colors.text
              : Colors.warning,
        }}>
        {statusText(analysis)}
      </Text>

      {completed && issues.length > 0 ? (
        <Text
          style={{
            marginTop: 6,
            fontSize: 13,
            color: Colors.textSecondary,
          }}>
          {issues.join(' · ')}
        </Text>
      ) : null}

      {children}
    </View>
  );
};

export default InspectionPhotoCard;
