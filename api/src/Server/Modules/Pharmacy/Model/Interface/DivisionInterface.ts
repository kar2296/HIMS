import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DivisionAttributes extends IAttributes {
    Id: number;
    DivisionCode: string;
    DivisionName: string;
    Description: string;
    OrganizationId: number;
    FacilityId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DivisionInstance extends Instance<DivisionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DivisionAttributes;
}
