import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ResearchProjectAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ProjectTypeId: number;
    ProjectCode: string;
    ProjectName: string;
    StartDate: Date;
    EndDate: Date;
    Comments: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ResearchProjectInstance extends Instance<ResearchProjectAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ResearchProjectAttributes;
}
