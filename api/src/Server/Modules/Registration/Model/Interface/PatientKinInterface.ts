import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientKinAttributes extends IAttributes {
    Id: number;
    RelationshipId: number;
    PatientId: number;
    TitleId: number;
    GenderId: number;
    Name: string;
    Age: number;
    DOB: Date;
    LandLine: string;
    Mobile: string;
    BloodGroupId: number;
    Comments: string;
    SameAddress: boolean;
    AddressLine1: string;
    AddressLine2: string;
    PinCodeId: number;
    Area: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    Pincode: string;
    City: string;
    State: string;
    Country: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientKinInstance extends Instance<PatientKinAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientKinAttributes;
}
