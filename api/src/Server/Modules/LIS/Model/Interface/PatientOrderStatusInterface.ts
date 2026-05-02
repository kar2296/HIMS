import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientOrderStatusAttributes extends IAttributes {
    Id: number;
    Encountersorderid: number;
    Orderdetailsid: number;
    orderdetailstatus: number;
    statuschangeddate: Date;
    billdate: Date;
    billingid: number;
    statusnotes: string;
    Quantity: number;
    statuschangedby: number;
    statuschangedbyname: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
}

export interface PatientOrderStatusInstance extends Instance<PatientOrderStatusAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientOrderStatusAttributes;
}
