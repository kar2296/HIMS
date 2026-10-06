import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorContactAttributes extends IAudit {
    Id: number;
    VendorFacilityMapId: number;
    VendorMasterId: number;
    VendorCode: string;
    VendorName: string;
    ContactTypeId: number;
    ContactPerson: string;
    MobileNo: string;
    PhoneNo: string;
    EMail: string;
    IsPrimary: boolean;
    AddressLine1: string;
    AddressLine2: string;
    PinCodeId: number;
    Area: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    DistrictId: number;
    ContactStatusId: number;
    IsActive: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VendorContactInstance extends Instance<VendorContactAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorContactAttributes;
}
