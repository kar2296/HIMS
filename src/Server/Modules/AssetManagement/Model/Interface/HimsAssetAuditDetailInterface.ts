import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetAuditDetailAttributes extends IAttributes {
    Id: number;
    AssetAuditId: number;
    AssetName: string;
    AssetTypeId: string;
    Serial: string;
    ModelNum: string;
    Quantity: number;
    ExpectedQuantity: number;
    ReconcileQuantity: number;
    ManufacturerId: string;
    DepartmentId: string;
    LOCATIONId: number;
    StartDate: Date;
    AuditStatusId: number;
    AssetId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetAuditDetailInstance extends Instance<AssetAuditDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetAuditDetailAttributes;
}
