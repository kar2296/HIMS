import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TemplateMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Name: string;
    TemplateTypeId: number;
    AccessibleTypeId: number;
    DepartmentId: number;
    UserId: number;
    IsActive: boolean;
    IsAllFacility: boolean;
    IsAllDepartment: boolean;
    IsAllUser: boolean;
    ActiveStatusId: number;
    DrugAdvice:string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TemplateMasterInstance extends Instance<TemplateMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TemplateMasterAttributes;
}
