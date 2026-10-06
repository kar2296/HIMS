import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OrganizationAttributes extends IAttributes {
    Id: number;
    OrgCode: string;
    OrgName: string;
    AddressLine1: string;
    AddressLine2: string;
    PinCode: string;
    Area: string;
    City: string;
    State: string;
    Country: string;
    OrgStatusId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsBeds: boolean;
    IsDoctors: boolean;
    IsFacility: boolean;
    BedsCount: number;
    DoctorsCount: number;
    FacilityCount: number;
    LicenseActiveFrom: Date;
    LicenseActiveTo: Date;
    PinCodeId: number;
    CityId: number;
    StateId: number;
    CountryId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    LogoPath: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OrganizationInstance extends Instance<OrganizationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OrganizationAttributes;
}
