import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface QMSAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    QMSReasonId: number;
    PatientId: number;
    TitleId: number;
    MRN: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Age: number;
    DOB: Date;
    GenderId: number;
    LandLine: string;
    Mobile: string;
    Email: string;
    RegisteredDate: Date;
    TokenNo: number;
    GuardianName: string;
    ReligionId: number;
    AddressLine1: string;
    AddressLine2: string;
    Pincode: string;
    Area: string;
    City: string;
    State: string;
    Country: string;
    PinCodeId: number;
    CityId: number;
    StateId: number;
    CountryId: number;
    IsPatientCreated: boolean;
    QMSStatusId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface QMSInstance extends Instance<QMSAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: QMSAttributes;
}
