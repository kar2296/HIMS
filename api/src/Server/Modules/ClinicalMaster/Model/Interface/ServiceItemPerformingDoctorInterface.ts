import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceItemPerformingDoctorAttributes extends IAttributes {
    Id: number;
    ServiceItemId: number;
    ServiceRateCategoryId: number;
    Rate: number;
    EncounterId: number;
    PatientBillId: number;
    DoctorId: number;
    DoctorName: string;
    FacilityId: number;
    ShareTypeId: number;
    DoctorShareValue: number;
    DoctorShare: string;
    VisitTypeId: number;
    TeamId: number;
    StatusId: number;
    IsDisplayAllDoctors: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceItemPerformingDoctorInstance extends Instance<ServiceItemPerformingDoctorAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceItemPerformingDoctorAttributes;
}
