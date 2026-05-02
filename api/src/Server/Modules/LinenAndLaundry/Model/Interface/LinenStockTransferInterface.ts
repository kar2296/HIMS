import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LinenStockTransferAttributes extends IAttributes {
    Id: number;
    LinenStockTransferNo: string;
    LinenStockTransferDate: Date;
    LinenStockRequestId: number;
    LinenStockRequestNo: number;
    LinenStockRequestDate: Date;
    FromDepartmentId: number;
    ToDepartmentId: number;
    FromFacilityId: number;
    ToFacilityId: number;
    OrgId: number;
    IssuedById: number;
    LinenStockRequestStatusId:number;
    LinenStockTransferStatusId: number;
    ReceivedBy:number;
    ReceivedDate:Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenStockTransferInstance extends Instance<LinenStockTransferAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LinenStockTransferAttributes;
}
