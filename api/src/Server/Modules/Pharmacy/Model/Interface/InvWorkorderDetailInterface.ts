import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface InvWorkorderDetailAttributes extends IAttributes {
    Id: number;
    InvWorkorderId: number;
    ParticularId: number;
    ParticularHead: string;
    Particulars: string;
    Quantity: number;
    SACCode: number;
    Amount: number;
    DiscountModeId: number;
    Discount: number;
    GstId: number;
    GstPercentage: number;
    TaxAmount: number;
    GrossAmount: number;
    NetAmount: number;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface InvWorkorderDetailInstance extends Instance<InvWorkorderDetailAttributes> {
    dataValues: InvWorkorderDetailAttributes;
}


