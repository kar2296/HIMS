import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClinicalRemarkAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Code: string;
    ClinicalRemarks: string;
    ClinicalRemarkTypeId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ClinicalRemarkInstance extends Instance<ClinicalRemarkAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClinicalRemarkAttributes;
}
