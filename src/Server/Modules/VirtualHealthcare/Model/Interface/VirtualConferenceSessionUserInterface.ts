import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualConferenceSessionUserAttributes extends IAttributes {
    Id: number;
    ConferenceRoomId: string;
    ExternalUserId: number;
    Name: string;
    Role: string;
    JoinedTime: Date;
    LeftTime: Date;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualConferenceSessionUserInstance extends Instance<VirtualConferenceSessionUserAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualConferenceSessionUserAttributes;
}
