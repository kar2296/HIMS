import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPFileRequestAttributes extends IAttributes {
    Id: number;
    MrdIPfileId: number;
    RequestDate: Date;
    TypeId: number;
    PatientId: number;
    PatientName: string;
    PatientMrn: string;
    EncounterId: number;
    VisitNo: string;
    DoctorId: number;
    DoctorName: string;
    AdmissionDate: Date;
    DischargeDate: Date;
    RequestBy: number;
    ApprovedBy: number;
    ApprovedDate: Date;
    TransferredBy: number;
    TransferredDate: Date;
    ReceivedBy: number;
    ReceivedDate: Date;
    Reason: string;
    MRDIPFileStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IPFileRequestInstance extends Instance<IPFileRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPFileRequestAttributes;
}
