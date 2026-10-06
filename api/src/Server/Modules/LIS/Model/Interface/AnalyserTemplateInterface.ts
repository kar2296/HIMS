import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AnalyserTemplateAttributes extends IAttributes {
    Id: number;
    AnalyteId: string;
    GenderId: number;
    Comments: string;
    AnalyserTemplateTypeId: number;
    NoOfPendingServices: number;
    FacilityId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AnalyserTemplateInstance extends Instance<AnalyserTemplateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalyserTemplateAttributes;
}
