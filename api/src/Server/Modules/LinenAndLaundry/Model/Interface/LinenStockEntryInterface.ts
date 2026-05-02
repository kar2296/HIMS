import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LinenStockEntryAttributes extends IAttributes {
    Id: number;
    LinenStockEntryNumber: string;
    LinenStockEntryDate: Date;
    LinenStockEntryTypeId: number;
    LinenStockEntryStatusId: number;
    DepartmentId: number;
    DepartmentName: string;
    EnteredBy: number;
    EnteredDate: Date;
    EntryComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    FacilityId: number;
    OrganisationId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenStockEntryInstance extends Instance<LinenStockEntryAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LinenStockEntryAttributes;
}
