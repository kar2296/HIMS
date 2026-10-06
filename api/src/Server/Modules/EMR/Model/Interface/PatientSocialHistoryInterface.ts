import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientSocialHistoryAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    SocialTypeId: number;
    SocialFrequencyId: number;
    SeverityId: number;
    ReviewDate: Date;
    Comments: string;
    SocialHistoryStatusId: number;
    PerformedDate: Date;
    PerformedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientSocialHistoryInstance extends Instance<PatientSocialHistoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientSocialHistoryAttributes;
}
