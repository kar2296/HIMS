import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientStockReturnDetailsAttributes extends IAttributes {
    Id: number;
    PatientStockRequestDetailId: number;
    PatientBillDetailId: number;
    PatientBillId: number;
    PatientStockReturnId: number;
    EncounterId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    IsSupplementary: boolean;
    ReturnQuantity: number;
    ReceivedQuantity: number;
    ReturnStatusId: number;
    StockItemId: number;
    StockSerialItemId: number;
    BatchId: string;
    ExpiryDate: Date;
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

export interface PatientStockReturnDetailsInstance extends Instance<PatientStockReturnDetailsAttributes> {
    dataValues: PatientStockReturnDetailsAttributes;
}


