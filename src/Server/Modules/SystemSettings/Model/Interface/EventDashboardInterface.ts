import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EventDashboardAttributes extends IAttributes {
    Id: number;
    EventDirectionId: number;
    EventTypeId: number;
    EventName: string;
    EventSourceId: number;
    EventSourceKey: string;
    EventDestinationId: number;
    EvenDestinationKey: number;
    EntityTypeId: number;
    EventEntityId: number;
    ConsultationId: number;
    EncounterId: number;
    PatientId: number;
    EventDataTypeId: number;
    EventData: string;
    EventStatusId: number;
    EventMessage: string;
    EventTrace: string;
    PracticeId: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EventDashboardInstance extends Instance<EventDashboardAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EventDashboardAttributes;
}
