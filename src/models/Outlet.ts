import {
  InspectionImageUpload,
} from './InspectionUpload';

export interface Outlet {

  roNumber: string;

  outletName: string;

  districtId: string;

  location: string;

  phoneNumber?: string;

  logo?: string;

  active: boolean;

  /**
   * Inspection images belonging to this RO.
   *
   * These images belong to the outlet/RO,
   * not to an individual user.
   */
  inspectionImages: InspectionImageUpload[];
}