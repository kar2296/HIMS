import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GstReportAttributes extends IAttributes {
    RUNDATE: Date;
    STORES: string;
    FROMDATE: Date;
    TODATE: Date;
    GST_TYPE: string;
    SALE_TOTAL_AMOUNT: number;
    SALE_TAXABLE: number;
    PaymentTypeId: number;
    SALE_NEW_GST: number;
    RETURN_TOTAL_AMOUNT: number;
    RETURN_TAXABLE: number;
    RETURN_NEW_GST: number;
    SALEmRETURN: number;
    SALEmRETURN_TAX: number;
    FINAL_GST: number;
    new_gstcol: string;
    new_gstcol1: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GstReportInstance extends Instance<GstReportAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GstReportAttributes;
}
