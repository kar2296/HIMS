import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StoreMasterAttributes extends IAttributes {
    Id: number;
    StoreCode: string;
    StoreName: string;
    StoreDescription: string;
    StoreTypeId: number;
    StoreSubTypeId: number;
    StorePolicyId: number;
    DepartmentId: number;
    AddressLine1: string;
    AddressLine2: string;
    LocationId: number;
    FacilityId: number;
    LicenseNo: string;
    LicenseNo1:string;
    TinNo: string;
    Email: string;
    IsDefaultWardindentStore: boolean;
    IsSeqbasedStore: boolean;
    Password: string;
    ExpiryWarningDays: number;
    ExpiryPriorStopDays: number;
    LeadTimeForPO: string;
    AccountCode: string;
    SubAccountCode: string;
    Privillages: string;
    BlockMaterialRequest: boolean;
    PurchaseReturnToRespectiveVendor: boolean;
    IsPrimaryStore: boolean;
    PrinterOptionId: number;
    SequenceOptionId: number;
    IsRequestMandatory: boolean;
    IsManualBatchSelection: boolean;
    IsPOMandatory: boolean;
    CanAllowIPDiscount: boolean;
    CanAllowOpenPO: boolean;
    CanAllowOpenGRN: boolean;
    GRNApprovalRequired: boolean;
    StockRequestApprovalRequired: boolean;
    IsDefaultPrescriptionStore: boolean;
    CanSeeToStoreQty: boolean;
    IsGstEditablePo: boolean;
    IsOpticalStore: boolean;
    OpenAutoReOrder: boolean;
    AllowOpenRequest: boolean;
    ISSeparatePayCounter: boolean;
    LogoPath: string;
    ActiveStatusId: number;
    IsActive: boolean;
    IsIndentStore: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    WholeSaleLicenseNumber1: number;
    WholeSaleLicenseNumber2: number;
    ScheduleXDLNo: number;
    CSTNumber: number;
    IsWhatsapp: boolean;
}

export interface StoreMasterInstance extends Instance<StoreMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StoreMasterAttributes;
}
