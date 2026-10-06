import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TickSheetMasterAttributes extends IAttributes {
    Id: number;
    TickSheetTypeId: number;
    FacilityId: number;
    AccessibleTypeId: number;
    DepartmentId: number;
    UserId: number;
    TickSheetName: string;
    TickSheetMasterTypeId: number;
    TickSheetMasterTypeName: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TickSheetMasterInstance extends Instance<TickSheetMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TickSheetMasterAttributes;
}
