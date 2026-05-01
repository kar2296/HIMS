import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface MessageAttributes extends IAttributes {
    Id: number;
    ParentMessageId: number;
    UserTypeId: number;
    SendDate: Date;
    FromUserId: number;
    ToUserId: number;
    MessageTypeId: number;
    PriorityId: number;
    Subject: string;
    Description: string;
    OrganizationId: number;
    FacilityId: number;
    ToOrganizationId: number;
    ToFacilityId: number;
    MessageStatusId: number;
    Attachment: string;
    IsRead: boolean;
    ReadDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface MessageInstance extends Instance<MessageAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: MessageAttributes;
}
