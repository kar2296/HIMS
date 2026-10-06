import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientCommentAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    CommentsTypeId: number;
    CommentOn: Date;
    CommentBy: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientCommentInstance extends Instance<PatientCommentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientCommentAttributes;
}
