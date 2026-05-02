import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientAdmissionRequestLogAttributes extends IAttributes {
    Id: number;
    PatientAdmissionRequestId: number;
    AdmissionRequestStatusId   : number;
	Reason: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAdmissionRequestLogInstance extends Instance<PatientAdmissionRequestLogAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAdmissionRequestLogAttributes;
}
