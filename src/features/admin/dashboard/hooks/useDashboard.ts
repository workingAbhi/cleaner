import { useCallback, useEffect, useMemo, useState } from 'react';

import { MasterApi, InspectionUploadApi, InspectionAnalysisApi } from '../../../../core/services/api';

import {
  Territory,
  SalesArea,
  District,
  Outlet,
  InspectionImageUpload,
  AiAnalysis,
} from '../../../../models';

const withinDays = (iso: string, days: string) => {
  if (days === 'all') {
    return true;
  }

  const created = new Date(iso).getTime();
  const windowMs = Number(days) * 24 * 60 * 60 * 1000;

  return Date.now() - created <= windowMs;
};

export default function useDashboard() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [allSalesAreas, setAllSalesAreas] = useState<SalesArea[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [allOutlets, setAllOutlets] = useState<Outlet[]>([]);

  const [territoryId, setTerritoryId] = useState('');
  const [salesAreaId, setSalesAreaId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [days, setDays] = useState('all');

  const [uploads, setUploads] = useState<InspectionImageUpload[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AiAnalysis>>({});
  const [loading, setLoading] = useState(false);

  const loadEvidence = useCallback(async () => {
    try {
      setLoading(true);

      const [images, latest] = await Promise.all([
        InspectionUploadApi.getAllImages(),
        InspectionAnalysisApi.getLatestAll(),
      ]);

      setUploads(images);
      setAnalyses(latest);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMaster = async () => {
      const [
        nextTerritories,
        nextSalesAreas,
        nextDistricts,
        nextOutlets,
      ] = await Promise.all([
        MasterApi.getTerritories(),
        MasterApi.getSalesAreas(),
        MasterApi.getDistricts(),
        MasterApi.getOutlets(),
      ]);

      setTerritories(nextTerritories);
      setAllSalesAreas(nextSalesAreas);
      setAllDistricts(nextDistricts);
      setAllOutlets(nextOutlets);
    };

    loadMaster();
    loadEvidence();
  }, [loadEvidence]);

  useEffect(() => {
    const hasPending = Object.values(analyses).some(
      analysis => analysis.status === 'PROCESSING',
    );

    if (!hasPending) {
      return;
    }

    const timer = setInterval(() => {
      void loadEvidence();
    }, 4000);

    return () => clearInterval(timer);
  }, [analyses, loadEvidence]);

  const salesAreas = useMemo(
    () =>
      territoryId
        ? allSalesAreas.filter(item => item.territoryId === territoryId)
        : [],
    [allSalesAreas, territoryId],
  );

  const districts = useMemo(
    () =>
      salesAreaId
        ? allDistricts.filter(item => item.salesAreaId === salesAreaId)
        : [],
    [allDistricts, salesAreaId],
  );

  const outlets = useMemo(
    () =>
      districtId
        ? allOutlets.filter(item => item.districtId === districtId)
        : [],
    [allOutlets, districtId],
  );

  const selectTerritory = (id: string) => {
    setTerritoryId(id);
    setSalesAreaId('');
    setDistrictId('');
    setOutletId('');
  };

  const selectSalesArea = (id: string) => {
    setSalesAreaId(id);
    setDistrictId('');
    setOutletId('');
  };

  const selectDistrict = (id: string) => {
    setDistrictId(id);
    setOutletId('');
  };

  const clearFilters = () => {
    setTerritoryId('');
    setSalesAreaId('');
    setDistrictId('');
    setOutletId('');
    setDays('all');
  };

  const visibleUploads = useMemo(() => {
    const allowedRos = new Set<string>();

    allOutlets.forEach(outlet => {
      const district = allDistricts.find(item => item.id === outlet.districtId);
      const salesArea = allSalesAreas.find(
        item => item.id === district?.salesAreaId,
      );

      if (outletId && outlet.roNumber !== outletId) {
        return;
      }

      if (districtId && outlet.districtId !== districtId) {
        return;
      }

      if (salesAreaId && salesArea?.id !== salesAreaId) {
        return;
      }

      if (territoryId && salesArea?.territoryId !== territoryId) {
        return;
      }

      allowedRos.add(outlet.roNumber);
    });

    const filterByHierarchy =
      Boolean(territoryId || salesAreaId || districtId || outletId);

    return uploads.filter(upload => {
      if (filterByHierarchy && !allowedRos.has(upload.roId)) {
        return false;
      }

      return withinDays(upload.createdAt, days);
    });
  }, [
    allDistricts,
    allOutlets,
    allSalesAreas,
    days,
    districtId,
    outletId,
    salesAreaId,
    territoryId,
    uploads,
  ]);

  const outletLabel = (roId: string) => {
    const outlet = allOutlets.find(item => item.roNumber === roId);
    return outlet
      ? `${outlet.roNumber} · ${outlet.outletName}`
      : roId;
  };

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
    setDays,
    setOutletId,
    selectTerritory,
    selectSalesArea,
    selectDistrict,
    clearFilters,
    uploads: visibleUploads,
    analyses,
    loading,
    loadEvidence,
    outletLabel,
  };
}
