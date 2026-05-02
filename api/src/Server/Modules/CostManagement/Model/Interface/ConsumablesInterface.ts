import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ConsumablesAttributes extends IAttributes {
    Id: number;
    CostDetailId: number;
    TransactionId: number;
    TransactionTypeId: number;
    ItemId: number;
	 FacilityId: number;
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    CostTypeId: number;
    TypeId: number;
    UCP: number;
    Amount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ConsumablesInstance extends Instance<ConsumablesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ConsumablesAttributes;
}
