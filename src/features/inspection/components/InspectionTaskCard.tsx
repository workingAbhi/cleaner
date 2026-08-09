import React from 'react';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  InspectionItem,
} from '../../../models';

import styles from './InspectionTaskCard.styles';

interface Props {

  item: InspectionItem;

  completed: boolean;

  onPress(): void;

}

const InspectionTaskCard = ({
  item,
  completed,
  onPress,
}: Props) => {

  return (

    <Pressable

      style={styles.card}

      onPress={onPress}>

      <View style={styles.left}>

        <View
          style={[
            styles.status,

            completed &&
              styles.completedStatus,
          ]}>

          <Text
            style={styles.statusIcon}>
            {completed ? '✓' : '○'}
          </Text>

        </View>

        <View>

          <Text style={styles.title}>
            {item.title}
          </Text>

          <Text style={styles.subtitle}>

            {completed
              ? 'Completed'
              : 'Pending'}

          </Text>

        </View>

      </View>

      <Text style={styles.arrow}>
        ›
      </Text>

    </Pressable>

  );

};

export default InspectionTaskCard;