import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ReferralAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ReferralTypeId: number;
    ReferralCode: string;
    ReferralName: string;
    MarketingPersonId: number;
    ContactPerson: string;
    PhoneNo: string;
    FaxNo: string;
    Email: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    AddressLine1: string;
    AddressLine2: string;
    PinCodeId: number;
    Area: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    BirthDate: Date;
    AnniversaryDate: Date;
    Qualification: string;
    SpecialityId: number;
    PANNo: string;
    Source: string;
    AccountNo: string;
    BankNo: string;
    IFSCCode: string;
    ActiveStatusId: number;
    IsActive: boolean;
    IsDefault: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferralInstance extends Instance<ReferralAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferralAttributes;
}
