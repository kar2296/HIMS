import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OrderStatusAttributes extends IAttributes {
    Id: number;
    Menmonics: string;
    Orderstatuse: string;
    DisplayName: string;
    HL7Code: string;
    Type: number;
    ActiveStaute: number;
    IsDietStatus:boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OrderStatusInstance extends Instance<OrderStatusAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OrderStatusAttributes;
}
