import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface NewAssetRequestAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    AssetName: string;
    AssetRequestTypeId: number;
    DepartmentId: number;
    ManufacturerId: number;
    IsManufacturer: Boolean;
    Manufacturer: string;
    IsPreferredSupplier: Boolean;
    PreferredSupplierId: number;
    PreferredSupplier: string;
    ApproximateValue: string;
    RequestedById: number;
    RequestedDate: Date;
    RequestedComments: string;
    ApprovedById: number;
    ApprovedDate: Date;
    ApprovedComments: string;
    RejectedById: number;
    RejectedDate: Date;
    RejectedComments: string;
    CancelledDate: Date;
    CancelledById: number;
    CancelledComments: string;
    Description: string;
    AssetRequestStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface NewAssetRequestInstance extends Instance<NewAssetRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: NewAssetRequestAttributes;
}
