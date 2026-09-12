import React from 'react';

import {
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  Button,
} from '../../../../core/components';

import {
  Colors,
} from '../../../../core/theme';

import {
  InspectionPhotoCard,
} from '../../../inspection/components';

import useDashboard from '../hooks/useDashboard';

import {
  DashboardHeader,
  FilterDropdown,
} from '../components';

import styles from './DashboardScreen.styles';

const DashboardScreen = () => {
  const dayOptions = [
    { id: 'all', name: 'All time' },
    { id: '1', name: 'Last 24 hours' },
    { id: '7', name: 'Last 7 days' },
    { id: '15', name: 'Last 15 days' },
  ];

  const {
    territories,
    salesAreas,
    districts,
    outlets,
    territoryId,
    salesAreaId,
    districtId,
    outletId,
    days,
    setDays,
    setOutletId,
    selectTerritory,
    selectSalesArea,
    selectDistrict,
    clearFilters,
    uploads,
    analyses,
    loading,
    loadEvidence,
    outletLabel,
  } = useDashboard();

  useFocusEffect(
    React.useCallback(() => {
      loadEvidence();
    }, [loadEvidence]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <DashboardHeader />

      <FilterDropdown
        label="Territory"
        value={territoryId}
        options={territories}
        getValue={item => item.id}
        getLabel={item => item.name}
        onChange={selectTerritory}
      />

      {territoryId !== '' && (
        <FilterDropdown
          label="Sales Area"
          value={salesAreaId}
          options={salesAreas}
          getValue={item => item.id}
          getLabel={item => item.name}
          onChange={selectSalesArea}
        />
      )}

      {salesAreaId !== '' && (
        <FilterDropdown
          label="District"
          value={districtId}
          options={districts}
          getValue={item => item.id}
          getLabel={item => item.name}
          onChange={selectDistrict}
        />
      )}

      {districtId !== '' && (
        <FilterDropdown
          label="Outlet"
          value={outletId}
          options={outlets}
          getValue={item => item.roNumber}
          getLabel={item =>
            `${item.roNumber} • ${item.outletName}`
          }
          onChange={setOutletId}
        />
      )}

      <FilterDropdown
        label="Time Period"
        value={days}
        options={dayOptions}
        getValue={item => item.id}
        getLabel={item => item.name}
        onChange={setDays}
      />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Clear filters"
          variant="outline"
          onPress={clearFilters}
        />
      </View>

      <Text
        style={{
          marginTop: 24,
          fontSize: 18,
          fontWeight: '700',
          color: Colors.text,
        }}>
        {outletId
          ? `Photos · ${outletLabel(outletId)}`
          : 'Photos · all ROs'}
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 13,
          color: Colors.textSecondary,
        }}>
        {loading
          ? 'Loading inspection photos...'
          : uploads.length === 0
            ? 'No inspection photos in this filter.'
            : `${uploads.length} photo${uploads.length === 1 ? '' : 's'}`}
      </Text>

      {uploads.map(upload => (
        <InspectionPhotoCard
          key={upload.id}
          upload={upload}
          analysis={analyses[upload.id]}
          outletLabel={outletLabel(upload.roId)}
        />
      ))}
    </ScrollView>
  );
};

export default DashboardScreen;
