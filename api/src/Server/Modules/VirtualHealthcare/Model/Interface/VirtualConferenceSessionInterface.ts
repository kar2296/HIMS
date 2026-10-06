import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualConferenceSessionAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    ConferenceId: number;
    ConferenceRoomId: string;
    StartTime: string;
    EndTime: string;
    Duration: string;
    ParticipantCount: number;
    ConferenceXML: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualConferenceSessionInstance extends Instance<VirtualConferenceSessionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualConferenceSessionAttributes;
}
