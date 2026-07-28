import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, Spacing } from '../../../core/theme';
import { OutletHierarchy } from '../../../models';

interface Props {
  hierarchy: OutletHierarchy;
}

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>

    <Text style={styles.value}>{value}</Text>
  </View>
);

const OutletInfoCard = ({
  hierarchy,
}: Props) => {
  return (
    <View style={styles.card}>
      <Row
        label="Outlet"
        value={hierarchy.outlet.outletName}
      />

      <Row
        label="Territory"
        value={hierarchy.territory.name}
      />

      <Row
        label="Sales Area"
        value={hierarchy.salesArea.name}
      />

      <Row
        label="District"
        value={hierarchy.district.name}
      />

      <Row
        label="Location"
        value={hierarchy.outlet.location}
      />
    </View>
  );
};

export default OutletInfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  value: {
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
});