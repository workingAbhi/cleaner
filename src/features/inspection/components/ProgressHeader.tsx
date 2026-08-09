import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import styles from './ProgressHeader.styles';

interface Props {

  current: number;

  total: number;

  progress: number;

}

const ProgressHeader = ({
  current,
  total,
  progress,
}: Props) => {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Inspection Progress
      </Text>

      <Text style={styles.subtitle}>
        Step {current} of {total}
      </Text>

      <View style={styles.track}>

        <View
          style={[
            styles.fill,
            {
              width: `${
                progress * 100
              }%`,
            },
          ]}
        />

      </View>

    </View>

  );

};

export default ProgressHeader;