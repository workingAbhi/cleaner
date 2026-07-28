import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import {
  Button,
} from '../../../core/components';

import {
  InspectionItem,
} from '../../../models';

import styles from './InspectionItemCard.styles';

interface Props {
  item: InspectionItem;

  imageUri?: string;

  onUpload(): void;
}

const InspectionItemCard = ({
  item,
  imageUri,
  onUpload,
}: Props) => {
  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        {item.title}
      </Text>

      <Button
        title={
          imageUri
            ? 'Change Photo'
            : 'Upload Photo'
        }
        onPress={onUpload}
      />

    </View>
  );
};

export default InspectionItemCard;