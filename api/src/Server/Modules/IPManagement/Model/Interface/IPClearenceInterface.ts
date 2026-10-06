import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPClearenceAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientName: string;
    PatientMrn: string;
    EncounterId: number;
    VisitNo: string;
    WardId: number;
    RoomId: number;
    BedId: number;
    DoctorId: number;
    DoctorName: string;
    Comments: string;
    AdmissionStatusId: number;
    DepartmentId: number;
    IPClearenceStatusId: number;
    IPClearenceDate: Date;
    RequestedBy: number;
    RequestedDate: Date;
    ApprovedBy: number;
    ApprovedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IPClearenceInstance extends Instance<IPClearenceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPClearenceAttributes;
}
