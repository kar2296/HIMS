import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockConsumptionAttributes extends IAttributes {
    Id: number;
    StockConsumptionNumber: number;
    ConsumptionTypeId: number;
    StoreMasterId: number;
    DepartmentId: number;
    EncounterId:number;
    PatientId:number;
    ProcedureId:number;
    DoctorId:number;
    Assistant:string;
    OTComments:string;
    StartTime:Date;
    EndTime:Date;
    LocationId: number;
    FacilityId: number;
    OrganisationId: number;
    ConsumedBy: number;
    ConsumptionDate: Date;
    // ConsumerCommentsComments: string;
    ConsumerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    CancelledBy: number;
    CancelledDate: Date;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    TotalGrossAmount: number;
    TotalNetAmount: number;
    ConsumptionStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockConsumptionInstance extends Instance<StockConsumptionAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StockConsumptionAttributes;
}
