import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AppointmentCategoryAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    AppointmentCategoryTypeId: number;
    Name: string;
    Color: string;
    Description: string;
    IsActive: boolean;
    ActiveStatusId: number;
    CancelorRescheduleComments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppointmentCategoryInstance extends Instance<AppointmentCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppointmentCategoryAttributes;
}
