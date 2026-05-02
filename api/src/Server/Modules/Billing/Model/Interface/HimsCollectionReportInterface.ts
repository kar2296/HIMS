import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CollectionReportAttributes extends IAttributes {
    Id: number;
    CollectionDate: Date;
    OpeningBalance: number;
    Cash: number;
    PettyCash: number;
    Deposit: number;
    BalanceCash: number;
    Card: number;
    EOD: number;
    VarianceCard: number;
    UPI: number;
    BankCredit: number;
    VarianceUPI: number;
    Chequeddwire: number;
    ChequeDeposit: number;
    VarianceCheque: number;
    FullTotal: number;
    IsUpdated: boolean;
    FacilityId: number;
    CollectionStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CollectionReportInstance extends Instance<CollectionReportAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CollectionReportAttributes;
}
