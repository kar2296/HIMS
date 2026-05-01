import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BankStatementDetailsAttributes extends IAttributes {
    Id: number;
    BankStatementId: number;
    Name: string;
    UserId: number;
    Cash: number;
	Card: number;
	Others: number;
    LHRC: number;
    Voucher: number;
    NetCash: number;
    ExcessShort: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}


export interface BankStatementDetailsInstance extends Instance<BankStatementDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BankStatementDetailsAttributes;
}
