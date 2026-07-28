import React from 'react';

import {
  View,
} from 'react-native';

import styles from './DashboardCard.styles';

interface Props {

  children: React.ReactNode;

}

const DashboardCard = ({
  children,
}: Props) => {

  return (

    <View style={styles.card}>
      {children}
    </View>

  );

};

export default DashboardCard;