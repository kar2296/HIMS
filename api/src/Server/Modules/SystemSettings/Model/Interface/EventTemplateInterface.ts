import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface EventTemplateAttributes extends IAttributes {
    Id: number;
    EventTypeId: number;
    FacilityId: number;
    TemplateContent: string;
    SmsTrigger: string;
    SampleMessage: string;
    ScheduleTime: string;
    IsRepeat: boolean;
    RepeatDuration: string;
    SentToPersonId: number;
    SentToPerson: string;
    SentToGroupId: number;
    SentToGroup: string;
    ModuleId: number;
    ModuleName: string;
    IsCronJob: boolean;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    EmailSubject: string;
    TemplateKey: string;
}

export interface EventTemplateInstance extends Instance<EventTemplateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EventTemplateAttributes;
}
