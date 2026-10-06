import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ImpressionMasterAttributes extends IAttributes {
    ImpressionId: number;
    Code: string;
    Name: string;
    ImpressionTypeId: number;
    ImpressionType: string;
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

export interface ImpressionMasterInstance extends Instance<ImpressionMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ImpressionMasterAttributes;
}
