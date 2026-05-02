import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceBillEntryAttributes extends IAttributes {
    Id: number;
    ServiceBillNo: string;
    ServiceBillDate: Date;
    ServiceBillEntryTypeId: number;
    ServiceBillTypeId: number;
    ServiceBillStatusId:number;
    DepartmentId: number;
    DepartmentName: string;
    VendorMasterId: number;
    VendorName: string;
    RaisedBy: number;
    RaisedDate: Date;
    RaisedComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    FacilityId: number;
    OrganisationId: number;
    Particulars:string;
    Amount:number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceBillEntryInstance extends Instance<ServiceBillEntryAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceBillEntryAttributes;
}
