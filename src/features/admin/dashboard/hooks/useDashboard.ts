import { useEffect, useState } from 'react';

import { MasterApi } from '../../../../core/services/api';

import {
  Territory,
  SalesArea,
  District,
  Outlet,
} from '../../../../models';

export default function useDashboard() {

  const [territories, setTerritories] =
    useState<Territory[]>([]);

  const [salesAreas, setSalesAreas] =
    useState<SalesArea[]>([]);

  const [districts, setDistricts] =
    useState<District[]>([]);

  const [outlets, setOutlets] =
    useState<Outlet[]>([]);

  const [territoryId, setTerritoryId] =
    useState('');

  const [salesAreaId, setSalesAreaId] =
    useState('');

  const [districtId, setDistrictId] =
    useState('');

  const [outletId, setOutletId] =
    useState('');

  const [days, setDays] =
    useState('1');

  //--------------------------------------------

  useEffect(() => {
    loadTerritories();
  }, []);

  //--------------------------------------------

  const loadTerritories =
    async () => {

      const result =
        await MasterApi.getTerritories();

      setTerritories(result);

    };

  //--------------------------------------------

  const selectTerritory =
    async (
      id: string,
    ) => {

      setTerritoryId(id);

      setSalesAreaId('');
      setDistrictId('');
      setOutletId('');

      setDistricts([]);
      setOutlets([]);

      const result =
        await MasterApi.getSalesAreas(
        );

      setSalesAreas(result);

    };

  //--------------------------------------------

  const selectSalesArea =
    async (
      id: string,
    ) => {

      setSalesAreaId(id);

      setDistrictId('');
      setOutletId('');

      setOutlets([]);

      const result =
        await MasterApi.getDistricts(
        );

      setDistricts(result);

    };

  //--------------------------------------------

  const selectDistrict =
    async (
      id: string,
    ) => {

      setDistrictId(id);

      setOutletId('');

      const result =
        await MasterApi.getOutlets(
        );

      setOutlets(result);

    };

  //--------------------------------------------

  return {

    territories,
    salesAreas,
    districts,
    outlets,

    territoryId,
    salesAreaId,
    districtId,
    outletId,
    days,

    setOutletId,
    setDays,

    selectTerritory,
    selectSalesArea,
    selectDistrict,

  };

}