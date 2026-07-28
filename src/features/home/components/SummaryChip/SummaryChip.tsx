import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import styles from './SummaryChip.styles';

interface Props {

  label: string;

  value: string | number;

}

const SummaryChip = ({
  label,
  value,
}: Props) => {

  return (

    <View style={styles.container}>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>

    </View>

  );

};

export default SummaryChip;