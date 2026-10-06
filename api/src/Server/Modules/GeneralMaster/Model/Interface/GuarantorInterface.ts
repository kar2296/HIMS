import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorAttributes extends IAttributes {
    Id: number;
    Code: string;
    GuarantorName: string;
    FacilityId: number;
    GuarantorTypeId: number;
    CreditLimit: number;
    AvailableLimit: number;
    ContractDate: Date;
    ContractExpiryDate: Date;
    TPAId: number;
    ServiceRateCategoryId: number;
    GuarantorClientTypeId: number;
    AddressLine1: string;
    AddressLine2: string;
    PinCodeId: number;
    Area: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    Phone: string;
    Email: string;
    BusinessDevelopmentManager: string;
    CreditAccountNo: string;
    DebitAccountNo: string;
    IsAllFacility: boolean;
    IsActive: boolean;
    ActiveStatusId: number;
    ReconsultDays: string;
    IsDiscount: boolean;
    Status: number;
    CoPayPercent: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsIPBedTariff: boolean;
    IsExcelUpload: boolean;
}

export interface GuarantorInstance extends Instance<GuarantorAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorAttributes;
}
