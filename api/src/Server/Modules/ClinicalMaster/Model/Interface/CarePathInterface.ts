import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathAttributes extends IAttributes {
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    DepartmentId: number;
    SpecialityId: number;
    CarePathTypeId: number;
    DiagnosisId: number;
    Alos: string;
    FilePath:string;
    SpecialInstruction: string;
    Activefrom: Date;
    Activeto: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathInstance extends Instance<CarePathAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathAttributes;
}
