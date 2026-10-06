import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorCardTypeAttributes extends IAttributes {
    Id: number;
    GuarantorId: number;
    FacilityId: number;
    CardMasterId:number;
    CardMasterTypeId:number;
    Code: string;
    Description: string;
    CardName:string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GuarantorCardTypeInstance extends Instance<GuarantorCardTypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorCardTypeAttributes;
}
