import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import styles from './FilterDropdown.styles';

interface Props<T> {

  label: string;

  value: string;

  options: T[];

  getValue(item: T): string;

  getLabel(item: T): string;

  onChange(
    value: string,
  ): void;

}

function FilterDropdown<T>({
  label,
  value,
  options,
  getValue,
  getLabel,
  onChange,
}: Props<T>) {

  return (

    <View style={styles.container}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.pickerContainer}>

        <Picker
          selectedValue={value}
          onValueChange={onChange}>

          <Picker.Item
            label={`Select ${label}`}
            value=""
          />

          {options.map(item => (

            <Picker.Item
              key={getValue(item)}
              value={getValue(item)}
              label={getLabel(item)}
            />

          ))}

        </Picker>

      </View>

    </View>

  );

}

export default FilterDropdown;