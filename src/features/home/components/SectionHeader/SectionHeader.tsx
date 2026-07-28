import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import styles from './SectionHeader.styles';

interface Props {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

const SectionHeader = ({
  title,
  subtitle,
  rightComponent,
}: Props) => {

  return (
    <View style={styles.container}>

      <View style={styles.left}>

        <Text style={styles.title}>
          {title}
        </Text>

        {!!subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}

      </View>

      {rightComponent}

    </View>
  );

};

export default SectionHeader;