import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BankStatementDenominationsAttributes extends IAttributes {
    Id: number;
    BankStatementId: number;
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

export interface BankStatementDenominationsInstance extends Instance<BankStatementDenominationsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BankStatementDenominationsAttributes;
}
