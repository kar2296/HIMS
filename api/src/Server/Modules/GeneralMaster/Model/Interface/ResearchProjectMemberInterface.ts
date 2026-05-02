import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ResearchProjectMemberAttributes extends IAttributes {
    Id: number;
    ResearchProjectId: number;
    UserId: number;
    IsIncharge: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ResearchProjectMemberInstance extends Instance<ResearchProjectMemberAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ResearchProjectMemberAttributes;
}
