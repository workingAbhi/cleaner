import React from 'react';

import {
    Alert,
    ScrollView,
} from 'react-native';

import {
    Button,
} from '../../../../core/components';

import useDashboard from '../hooks/useDashboard';

import {
    DashboardHeader,
    FilterDropdown,
} from '../components';

import styles from './DashboardScreen.styles';

const DashboardScreen = () => {

    const dayOptions = [
        {
            id: '1',
            name: 'Today',
        },
        {
            id: '7',
            name: 'Last 7 Days',
        },
        {
            id: '15',
            name: 'Last 15 Days',
        },
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

    } = useDashboard();

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

            {outletId !== '' && (

                <FilterDropdown
                    label="Time Period"
                    value={days}
                    options={dayOptions}
                    getValue={item => item.id}
                    getLabel={item => item.name}
                    onChange={setDays}
                />

            )}

            {outletId !== '' && (

                <Button

                    title="View Report"

                    onPress={() =>
                        Alert.alert(
                            'Reports',
                            'Dashboard summary coming next pack.',
                        )
                    }

                />

            )}

        </ScrollView>

    );

};

export default DashboardScreen;