import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RISInterfaceResultAttributes extends IAttributes {
    Id: number;
    RISId: number;
    OrganizationId: number;
    FacilityId: number;
    FirstName: string;
    MRNNo: string;
    WorkOrderId: number;
    TestmasterId: number;
    AnalyteCode: string;
    AnalyteId: string;
    AnalyteName: string;
    ResultValue: string;
    FullResultValue: string;
    Approved: boolean;
    ApprovedById: number;
    ApproveDt: Date;
    Rejected: boolean;
    RejectedById: number;
    RejectedDt: Date;
    FilePath: string;
    Comments: string;
    insertedTo: boolean;
    RisInterfaceStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    PatientId: number;
    DOB: Date;
    Gender: string;
    Modality: string;
    Modality1: string;
    VisitNo: string;
    DoctorName: string;
    TestCode: string;
    TestName: string;
    FacilityName: string;
    LastName: string;
    PatientType: string;
    UpdatedByUser: string;
    Priority: string;
}

export interface RISInterfaceResultInstance extends Instance<RISInterfaceResultAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RISInterfaceResultAttributes;
}
