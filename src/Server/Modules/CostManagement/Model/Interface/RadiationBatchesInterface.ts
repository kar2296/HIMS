import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface RadiationBatchesAttributes extends IAttributes {
    Id: number;
    RadiationBatchesId: string;
    TicketNumberIdentifier: number;
    RequestTypeId: number;
    AssetId: number;
    WorkOrderId: number;
    AssetName: string;
    EventDate: Date;
    EventDescription: string;
    MaintananceDate: Date;
    PerformedBy: string;
    MaintananceDescription: string;
    Cost: number;
    TotalMaintananceId: number;
    CompleteId: number;
    PendingId: number;
    NextSchedule: Date;
    RequesterId: number;
    RequesterName: string;
    Name: string;
    FacilityId: number;
    FromDepartmentId: number;
    ToDepartmentId: number;
    PriorityId: number;
    SeviorityId: number;
    ExpectedDate: Date;
    CompletedOn: Date;
    ServiceDescription: number;
    OtherInformation: string;
    RadiationBatchesStatusId: number;
    AssignTypeId: string;
    AssignedId: number;
    Impact: number;
    Attachment: string;
    FilePath: string;
    Remarks: number;
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
    WorkCompletedOn: Date;
    WorkClosureComments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface RadiationBatchesInstance extends Instance<RadiationBatchesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RadiationBatchesAttributes;
}
