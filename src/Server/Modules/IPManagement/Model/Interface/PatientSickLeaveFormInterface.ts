import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientSickLeaveFormAttributes extends IAttributes {
    Id: number;
    FormTypeId: number;
    LeaveDayTypeId: number;
    PatientId: number;
    EncounterId: number;
    DoctorId: number;
    LeaveFormNumber: string;
    IssueDate: Date;
    ValidFrom: Date;
    ValidTo: Date;
    DaysCount: number;
    Notes: string;
    Diagnosis: string;
    ChiefComplaints: string;
    IsExecutedFromDuty: boolean;
    IsFitforlightduty: boolean;
    Isproofofattandanceatpractice: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientSickLeaveFormInstance extends Instance<PatientSickLeaveFormAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientSickLeaveFormAttributes;
}
