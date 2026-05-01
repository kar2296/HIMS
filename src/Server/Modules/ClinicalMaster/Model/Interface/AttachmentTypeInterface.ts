import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AttachmentTypeAttributes extends IAttributes {
    Id: number;
    Name: string;
    Description: string;
    DepartmentId: number;
    ReferrenceLink: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AttachmentTypeInstance extends Instance<AttachmentTypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AttachmentTypeAttributes;
}
