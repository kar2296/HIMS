import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface HsnMasterAttributes extends IAttributes {
    Id: number;
    HSNCode: string;
    HSNName: string;
    HSNCompany: string;
    GstId: number;
    GstCode: string;
    GstPercentage: number;
    InGstId: number;
    InGstCode: string;
    InGstPercentage: number;
    CGstId: number;
    CGstCode: string;
    CGstPercentage: number;
    SGstId: number;
    SGstCode: string;
    SGstPercentage: number;
    Remarks: string;
    ActiveStatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface HsnMasterInstance extends Instance<HsnMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: HsnMasterAttributes;
}
