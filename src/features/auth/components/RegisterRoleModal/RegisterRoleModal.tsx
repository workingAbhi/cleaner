import React from 'react';

import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './RegisterRoleModal.styles';

interface Props {

  visible: boolean;

  onClose(): void;

  onUserPress(): void;

  onAdminPress(): void;

}

const RegisterRoleModal = ({
  visible,
  onClose,
  onUserPress,
  onAdminPress,
}: Props) => {

  return (

    <Modal
      visible={visible}
      animationType="fade"
      transparent>

      <View style={styles.overlay}>

        <View style={styles.card}>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}>

            <Text style={styles.close}>
              ✕
            </Text>

          </Pressable>

          <Text style={styles.title}>
            Register As
          </Text>

          <Text style={styles.subtitle}>
            Choose the account you want to create
          </Text>

          <TouchableOpacity
            style={styles.option}
            activeOpacity={0.8}
            onPress={onUserPress}>

            <Text style={styles.icon}>
              👤
            </Text>

            <View style={styles.optionTextContainer}>

              <Text style={styles.optionTitle}>
                Outlet User
              </Text>

              <Text style={styles.optionSubtitle}>
                Register an outlet operator
              </Text>

            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            activeOpacity={0.8}
            onPress={onAdminPress}>

            <Text style={styles.icon}>
              🛡
            </Text>

            <View style={styles.optionTextContainer}>

              <Text style={styles.optionTitle}>
                Administrator
              </Text>

              <Text style={styles.optionSubtitle}>
                Register an admin account
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </View>

    </Modal>

  );

};

export default RegisterRoleModal;