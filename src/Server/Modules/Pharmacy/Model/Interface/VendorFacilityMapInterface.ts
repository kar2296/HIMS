import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorFacilityMapAttributes extends IAttributes {
    Id: number;
    VendorMasterId: number;
    VendorCode: string;
    VendorName: string;
    VendorDescription: string;
    FacilityId: number;
    VendorTypeId: number;
    SupplyTypeId: number;
    Pincode: string;
    Area: string;
    City: string;
    State: string;
    Country: string;
    MobileNumber: string;
    PhoneNumber: string;
    FaxNumber: string;
    EmailAddress: string;
    ContactPerson: string;
    BusinessDomainId: number;
    DistributionTypeId: number;
    PaymentTermsId: number;
    LicenceCode: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    VendorUrl: string;
    LeadTime: number;
    CurrencyCodeId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsExcelUpload: boolean;
}

export interface VendorFacilityMapInstance extends Instance<VendorFacilityMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorFacilityMapAttributes;
}
