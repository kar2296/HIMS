import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LISInterfaceResultAttributes extends IAttributes {
    Id: number;
    LISId: number;
    OrganizationId: number;
    FacilityId: number;
    PatientName:string;
    MRNNo:string;
    AssetId: number;
    Sampleid: string;
    Code: string;
    AnalyteId: number;
    AnalyteName: string;
    ResultValue: string;
    FullResultValue: string;
    DisplayNo: number;
    Approved: boolean;
    ApprovedById:number;
    ApproveDt: Date;
    Rejected: boolean;
    RejectedById:number;
    RejectedDt: Date;
    FilePath: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    WorkOrderId: number;
}

export interface LISInterfaceResultInstance extends Instance<LISInterfaceResultAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LISInterfaceResultAttributes;
}
