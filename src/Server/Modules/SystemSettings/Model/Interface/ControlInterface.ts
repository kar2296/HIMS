import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ControlAttributes extends IAttributes {
    Id: number;
    ParentControlId: number;
    ModuleId: number;
    ModuleCode: string;
    Context: string;
    ControlCode: string;
    ActiveStatusId: number;
    IsActive: boolean;
    ParentControlCode: string;
    ControlType: string;
    ControlPosition: string;
    Display: string;
    SRef: string;
    IconRef: string;
    TranslateRef: string;
    Params : string;
    DisplayOrder : number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ControlInstance extends Instance<ControlAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ControlAttributes;
}
