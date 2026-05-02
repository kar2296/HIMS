import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface InventoryAttachmentAttributes extends IAttributes {
    Id: number;
    ItemId: number;
    ScreenName: string;
    AttachmentName: string;
    AttachmentTypeId: number;
    AttachmentType: string;
    ObjectTypeId: number;
    FilePath: string;
    Comments: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface InventoryAttachmentInstance extends Instance<InventoryAttachmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: InventoryAttachmentAttributes;
}
