import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StoreRackAttributes extends IAttributes {
    Id: number;
    StoreMasterId: number;
    StoreCode: string;
    StoreName: string;
    FacilityId: number;
    RackId: number;
    RackCode: string;
    RackName: string;
    RackDescription: string;
    ActiveStatusId: number;
    IsActive: boolean;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StoreRackInstance extends Instance<StoreRackAttributes> {
    dataValues: StoreRackAttributes;
}
