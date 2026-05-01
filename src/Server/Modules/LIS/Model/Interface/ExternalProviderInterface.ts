import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ExternalProviderAttributes extends IAttributes {
    Id: number;
    Code: string;
    ProviderName: string;
    Description: string;
    FacilityId: number;
    OrganizationId: number;
    TESTMASTERTYPId: number;
    ContactPerson: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    PinCodeId: string;
    Area: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    MobileNumber: string;
    PhoneNumber: String;
    FaxNumber: String;
    Comments: String;
    EmailAddress: string;
    LicenceCode: string;
    IsActive: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ExternalProviderInstance extends Instance<ExternalProviderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ExternalProviderAttributes;
}
