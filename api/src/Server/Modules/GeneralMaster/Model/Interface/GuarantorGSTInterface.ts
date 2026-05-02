import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface GuarantorGSTAttributes extends IAttributes {
    Id: number;
    GuarantorId: number;
    IsGSTRegistered: boolean;
    GSTId: string;
    BusinessRegNo: string;
    BusinessName: string;
    BusinessAddress: string;
    TaxCode: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GuarantorGSTInstance extends Instance<GuarantorGSTAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorGSTAttributes;
}
