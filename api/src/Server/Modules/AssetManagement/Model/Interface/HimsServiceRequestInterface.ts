import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceRequestAttributes extends IAttributes {
    Id: number;
    ServiceRequestId: string;
    TicketNumberIdentifier: number;
    RequestTypeId: number;
    AssetId: number;
    WorkOrderId: number;
    AssetName: string;
    Name: string;
    FacilityId: number;
    FromDepartmentId: number;
    ToDepartmentId: number;
    PriorityId: number;
    CategoryId: number;
    SeviorityId: number;
    Description: string;
    ReportedOn: Date;
    ExpectedDate: Date;
    CompletedOn: Date;
    ServiceDescription: number;
    OtherInformation: string;
    SubjectDetail: string;
    ServiceRequestStatusId: number;
    AssetTicketStatusId: number;
    AssignTypeId: string;
    AssignedId: number;
    Impact: number;
    ServiceTypeId: number;
    Attachments: string;
    FilePath: string;
    Remarks_Ins: string;
    Remarks_Exvend: string;
    AssignedBy: string;
    AssignedOn: Date;
    ClosedOn: Date;
    CompletedById: number;
    AdditionalCost: number;
    ServiceCharge: number;
    TechnicalDescription: string;
    Parts: string;
    WorkImpact: string;
    WorkComments: string;
    Comments: string;
    AssetTypeId: string;
    Signature: string;
    SignPath: string;
    Subject: string;
    WorkCompletedOn: Date;
    WorkClosureComments: string;
    ToFacilityId: number;
    AssignedFacilityId: number;
    AssignedVendorId: number;
    ReopenComments: string;
    ReportedBy: string;
    PhoneNo: string;
    RatingId: number;
    ShortCode: string;
    Status: number;
    Rev: number;
    RequestedBy: number;
    ReportedById: number;
    ResolvedBy: number;
    OnBehalfofUser: boolean;
    IsResovedOnPhone: boolean;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface ServiceRequestInstance extends Instance<ServiceRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceRequestAttributes;
}
