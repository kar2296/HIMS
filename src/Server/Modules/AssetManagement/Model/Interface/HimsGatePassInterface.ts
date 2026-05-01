import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GatePassAttributes extends IAttributes {
    Id: number;
    GatePassNo: string;
    GatePassTypeId: number;
    AssetId: number;
    AssetTypeId: number;
    AssetName: string;
    SerialNo: string;
    ModelNo: string;
    FacilityId: number;
    DepartmentId: number;
    VendorId: number;
    GatePassPurpose: string;
    GatePassDate: Date;
    DispatchedTypeId: number;
    DisposedBy: number;
    ApprovedBy: number;
    GatePassStatusId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GatePassInstance extends Instance<GatePassAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GatePassAttributes;
}
