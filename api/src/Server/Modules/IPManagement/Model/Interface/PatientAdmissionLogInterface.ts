import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientAdmissionLogAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
   // VisitIdentifier: number;
    AdmissionStatusId: number;
   AdmittingReasonId: number;
  	DoctorId: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAdmissionLogInstance extends Instance<PatientAdmissionLogAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAdmissionLogAttributes;
}
