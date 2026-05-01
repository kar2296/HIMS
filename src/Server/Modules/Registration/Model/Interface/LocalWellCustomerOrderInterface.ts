import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LocalWellCustomerOrderAttributes extends IAttributes {
    Id?: number;
    PatientId?: number;
    CustomerId?: number;
    CustomerOrderId?: number;
    OrderedDate?: Date;
    Status?: number;
    Rev?: number;
    CreatedBy?: number;
    CreatedAt?: Date;
    UpdatedBy?: number;
    UpdatedAt?: Date;
}

export interface LocalWellCustomerOrderInstance extends Instance<LocalWellCustomerOrderAttributes> {
    dataValues: LocalWellCustomerOrderAttributes;
}
