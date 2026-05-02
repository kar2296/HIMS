import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetDisposeAttributes extends IAttributes {
    Id: number;
    DisposeGroupId: number;
    DisposeTypeId: number;
    DisposeTypeName: string;
    DisposeTypeValue: boolean;
    DisposeStatusId: number;
    AssetId: number;
    AssetTypeId: number;
    AssetName: string;
    FacilityId: number;
    DepartmentId: number;
    VendorId: number;
    ReasonForNotification: string;
    RequestedBy: number;
    RequestedDate: Date;
    ApprovedBy: number;
    ApprovedDate: Date;
    AccessmentBy: number;
    AccessmentDate: Date;
    AccessmentComments: string;
    AccessmentApprovedBy: number;
    IsCommunicatetoUsers: boolean;
    IsEraseConfidentialInformation: boolean;
    IsRemoveAnySoftware: boolean;
    IsSafelyRemovefromService: boolean;
    IsTransfertoSafeandSecureStorage: boolean;
    IsUpdateCondemnationDatabase: boolean;
    DisposeMethodId: number;
    DisposeCost: string;
    VendorName: string;
    VendorDetails: string;
    DisposedBy: number;
    DisposedDate: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetDisposeInstance extends Instance<AssetDisposeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetDisposeAttributes;
}
