import {
  Territory,
  SalesArea,
  District,
  Outlet,
} from './';

export interface OutletHierarchy {
  territory: Territory;
  salesArea: SalesArea;
  district: District;
  outlet: Outlet;
}