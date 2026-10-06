import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClinicalFindingAttributes extends IAttributes {
    FindingId: number;
    Code: string;
    Name: string;
    FindingTypeId: number;
    DepartmentId: number;
    Description: string;
    FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    ActiveStatusId: number;
    IsActive: boolean;
}

export interface ClinicalFindingInstance extends Instance<ClinicalFindingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClinicalFindingAttributes;
}
