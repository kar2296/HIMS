import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetInsuranceAttributes extends IAttributes {
    Id: number;
    InsuranceId: number;
    InsuranceCode: string;
    InsuranceName: string;
    AssetId: number;
    IDVValue: string;
    PremimumAmount: string;
    PeriodStart: Date;
    PeriodEnd: Date;
    PolicyTypeId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetInsuranceInstance extends Instance<AssetInsuranceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetInsuranceAttributes;
}
