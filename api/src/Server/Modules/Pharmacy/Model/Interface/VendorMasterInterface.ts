import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorMasterAttributes extends IAttributes {
    Id: number;
    VendorCode: string;
    VendorName: string;
    VendorDescription: string;
    OrganizationId: number;
    VendorTypeId: number;
    SupplyTypeId: number;
    Pincode: string;
    Area: string;
    City: string;
    State: string;
    Country: string;
    MobileNumber: string;
    PhoneNumber: string;
    AdditionalPhoneNumber: string;
    FaxNumber: string;
    EmailAddress: string;
    ContactPerson: string;
    BusinessDomainId: number;
    DistributionTypeId: number;
    PaymentTermsId: number;
    LicenceCode: string;
    Comments: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    VendorUrl: string;
    LeadTime: number;
    CurrencyCodeId: number;
    FacilityId: number;
    IsActive: boolean;
    IsAssetVendor: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsTDS: boolean;
    TDSId: number;
    BillAmount: number;
    PaidAmount: number;
    TDSAmount: number;
    WriteOff: number;
    NetAmount: number;
    OutStandingAmount: number;
    ReturnedAmount: number;
    PANNo: string;
    GSTNo: string;
    TANNo: string;
    MSME: string;
    SupplierCategoryId: number;
    BankName: string;
    AccountNo: string;
    BankBranch: string;
    IFSCCode: string;
    ImagePath: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsExcelUpload: boolean;
}

export interface VendorMasterInstance extends Instance<VendorMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorMasterAttributes;
}
