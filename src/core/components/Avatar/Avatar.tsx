import React from 'react';

import {
  Image,
  Text,
  View,
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
} from '../../theme';

interface Props {
  name: string;

  image?: string;

  size?: number;
}

const Avatar = ({
  name,

  image,

  size = 48,
}: Props) => {
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{
          width: size,

          height: size,

          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <Text style={styles.text}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,

    justifyContent: 'center',

    alignItems: 'center',
  },

  text: {
    color: Colors.textInverse,

    fontWeight: '700',

    fontSize: 18,
  },
});

export default Avatar;