import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PMRAttributes extends IAttributes {
    Id: number;
    PMRCode: string;
    PMRName: string;
    ProcedureId: number;
    ProcedureCode: number;
    ProcedureName: string;
    PMRCategoryId: number;
    SpecialityId: number;
    FacilityId: number;
    ActiveStatusId: number;
    ApprovedBy: number;
    ApprovedAt: Date;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface PMRInstance extends Instance<PMRAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PMRAttributes;
}
