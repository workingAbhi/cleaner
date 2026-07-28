import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { UserRole } from '../../../models';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

interface Props {
  value: UserRole;

  onChange(
    role: UserRole,
  ): void;
}

const RoleSelector = ({
  value,
  onChange,
}: Props) => {
  return (
    <View style={styles.container}>

      <Pressable
        style={[
          styles.card,

          value === UserRole.USER &&
            styles.selected,
        ]}
        onPress={() =>
          onChange(UserRole.USER)
        }>

        <Text
          style={[
            styles.text,

            value === UserRole.USER &&
              styles.selectedText,
          ]}>
          User
        </Text>

      </Pressable>

      <Pressable
        style={[
          styles.card,

          value === UserRole.ADMIN &&
            styles.selected,
        ]}
        onPress={() =>
          onChange(UserRole.ADMIN)
        }>

        <Text
          style={[
            styles.text,

            value === UserRole.ADMIN &&
              styles.selectedText,
          ]}>
          Admin
        </Text>

      </Pressable>

    </View>
  );
};

export default RoleSelector;

const styles = StyleSheet.create({

  container: {

    flexDirection: 'row',

    gap: Spacing.md,

    marginBottom: Spacing.lg,
  },

  card: {

    flex: 1,

    paddingVertical: 16,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: Colors.border,

    alignItems: 'center',

    backgroundColor: Colors.card,
  },

  selected: {

    backgroundColor: Colors.primary,

    borderColor: Colors.primary,
  },

  text: {

    color: Colors.text,

    fontWeight: '600',

    fontSize: 16,
  },

  selectedText: {

    color: Colors.white,
  },
});