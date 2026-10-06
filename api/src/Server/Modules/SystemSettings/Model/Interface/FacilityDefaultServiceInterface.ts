import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FacilityDefaultServiceAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ServiceItemId: number;
    Quantity: number;
    PatientTypeId: number;
    VisitTypeId: number;
    GuarantorTypeId: number;
    GuarantorId: number;
    EligibleDaysFrom: number;
    EligibleDays: number;
    NooFVisitFree: number;
    StatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FacilityDefaultServiceInstance extends Instance<FacilityDefaultServiceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FacilityDefaultServiceAttributes;
}
