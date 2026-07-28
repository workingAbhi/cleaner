import {
  territories,
  salesAreas,
  districts,
  outlets,
} from '../../../data/master';

import {
  Territory,
  SalesArea,
  District,
  Outlet,
  OutletHierarchy,
} from '../../../models';

class MasterApi {
  async getTerritories(): Promise<Territory[]> {
    return [...territories];
  }

  async getSalesAreas(): Promise<SalesArea[]> {
    return [...salesAreas];
  }

  async getDistricts(): Promise<District[]> {
    return [...districts];
  }

  async getOutlets(): Promise<Outlet[]> {
    return [...outlets];
  }

  async getSalesAreasByTerritory(
    territoryId: string,
  ): Promise<SalesArea[]> {
    return salesAreas.filter(
      sa => sa.territoryId === territoryId,
    );
  }

  async getDistrictsBySalesArea(
    salesAreaId: string,
  ): Promise<District[]> {
    return districts.filter(
      district =>
        district.salesAreaId === salesAreaId,
    );
  }

  async getOutletsByDistrict(
    districtId: string,
  ): Promise<Outlet[]> {
    return outlets.filter(
      outlet => outlet.districtId === districtId,
    );
  }

  async getOutletByRoNumber(
    roNumber: string,
  ): Promise<Outlet | null> {
    return (
      outlets.find(
        outlet =>
          outlet.roNumber.toLowerCase() ===
          roNumber.toLowerCase(),
      ) ?? null
    );
  }

  async getOutletHierarchy(
    roNumber: string,
  ): Promise<OutletHierarchy | null> {
    const outlet = await this.getOutletByRoNumber(
      roNumber,
    );

    if (!outlet) {
      return null;
    }

    const district = districts.find(
      d => d.id === outlet.districtId,
    );

    if (!district) {
      return null;
    }

    const salesArea = salesAreas.find(
      sa => sa.id === district.salesAreaId,
    );

    if (!salesArea) {
      return null;
    }

    const territory = territories.find(
      t => t.id === salesArea.territoryId,
    );

    if (!territory) {
      return null;
    }

    return {
      territory,
      salesArea,
      district,
      outlet,
    };
  }
}

export default new MasterApi();