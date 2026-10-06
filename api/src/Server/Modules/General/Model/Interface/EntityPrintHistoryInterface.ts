import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EntityPrintHistoryAttributes extends IAttributes {
    Id: number;
    ObjectId: number;
    ObjectTypeId: number;
    PrintDate: number;
    PrintById: number;
    PrintTypeId: number;
    Reason: string;
    IsActive: boolean;
    FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EntityPrintHistoryInstance extends Instance<EntityPrintHistoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EntityPrintHistoryAttributes;
}
