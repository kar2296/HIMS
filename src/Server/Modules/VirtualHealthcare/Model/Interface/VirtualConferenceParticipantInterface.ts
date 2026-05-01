import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualConferenceParticipantAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    ConferenceId: number;
    ParticipantName: string;
    ParticipantUserId: number;
    DoctorId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualConferenceParticipantInstance extends Instance<VirtualConferenceParticipantAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualConferenceParticipantAttributes;
}
