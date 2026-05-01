import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LISInterfaceResultAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    AssetId: number;
    Sampleid: string;
    Code: string;
    ResultValue: string;
    FullResultValue: string;
    Approved: boolean;
    ApproveDt: Date;
    Rejected: boolean;
    RejectedDt: Date;
    FilePath: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LISInterfaceResultInstance extends Instance<LISInterfaceResultAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LISInterfaceResultAttributes;
}
