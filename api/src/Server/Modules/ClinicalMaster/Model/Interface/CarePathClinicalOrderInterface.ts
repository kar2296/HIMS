import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathClinicalOrderAttributes extends IAttributes {
    Id: number;
    CarePathId: number;
    TESTMASTERTYPId: number;
    TestName: string;
    TestmasterId: number;
    Quantity: number;
    Days: number;
    LoginCode: string;
    Comments: string;
    IsManditory: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathClinicalOrderInstance extends Instance<CarePathClinicalOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathClinicalOrderAttributes;
}
