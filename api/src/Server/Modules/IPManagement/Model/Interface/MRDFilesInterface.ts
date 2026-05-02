import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface MRDFilesAttributes extends IAttributes {
    Id: number;
    MrdIPfileId: number;
    ReturnDate: Date;
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
    ReturnBy: number;
    ReceivedBy: number;
    ReceivedDate: Date;
    Reason: string;
    MRDIPFileStatusId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface MRDFilesInstance extends Instance<MRDFilesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: MRDFilesAttributes;
}
