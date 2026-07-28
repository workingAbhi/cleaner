import React, {
  PropsWithChildren,
} from 'react';

import {
  Text,
  View,
} from 'react-native';

import { styles } from './Header.styles';

interface Props extends PropsWithChildren {
  title: string;
}

const Header = ({
  title,

  children,
}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {children}
    </View>
  );
};

export default Header;