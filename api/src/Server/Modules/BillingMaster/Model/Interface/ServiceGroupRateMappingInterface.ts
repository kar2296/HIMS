import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceGroupRateMappingAttributes extends IAttributes {
    Id: number;
    ServiceGroup: string;
    BedTypeId: number;
    Amount: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceGroupRateMappingInstance extends Instance<ServiceGroupRateMappingAttributes> {
    dataValues: ServiceGroupRateMappingAttributes;
}
