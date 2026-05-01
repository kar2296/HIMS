import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserBillingCounterDenominationsAttributes extends IAttributes {
    Id: number;
    UserBillingCounterId: number;
    CurrencyCodeId: number;
    DenominationId: number;
	DenominationCode: string;
	DenominationName: string;
    DenominationValue: number;
    DenominationCount: number;
    DenominationTotal: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserBillingCounterDenominationsInstance extends Instance<UserBillingCounterDenominationsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserBillingCounterDenominationsAttributes;
}
