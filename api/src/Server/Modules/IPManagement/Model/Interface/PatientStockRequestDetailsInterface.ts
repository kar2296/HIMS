import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientStockRequestDetailsAttributes extends IAttributes {
    Id: number;
    PatientStockRequestId: number;
    PrescriptionDetailId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    GenericId: number;
    GenericCode: string;
    GenericName: string;
    RequestedQuantity: number;
    DispensedQuantity: number;
    PurchaseUomId: number;
    SaleUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    Ucp: number;
    Mrp: number;
    GstId: number;
    GstPercentage: number;
    GstAmount: number;
    InGstId: number;
    InGstPercentage: number;
    InGstAmount: number;
    CGstId: number;
    CGstPercentage: number;
    CGstAmount: number;
    SGstId: number;
    SGstPercentage: number;
    SGstAmount: number;
    GrossAmount: number;
    NetAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientStockRequestDetailsInstance extends Instance<PatientStockRequestDetailsAttributes> {
    dataValues: PatientStockRequestDetailsAttributes;
}


