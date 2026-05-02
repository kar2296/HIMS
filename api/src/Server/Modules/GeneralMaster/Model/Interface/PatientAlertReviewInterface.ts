import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientAlertReviewAttributes extends IAttributes {
    Id: number;
    PatientAlertId: number;
    UserId: number;
    ReviewedOn: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAlertReviewInstance extends Instance<PatientAlertReviewAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAlertReviewAttributes;
}
