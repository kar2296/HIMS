import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientWorkorderAttachmentAttributes extends IAttributes {
    Id: number;
    Orderdetailid: number;
    Encounterorderid: number;
    Attachmentname: string;
    Attachmentfilename: string;
    Attachmenttype: string;
    Path: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
}

export interface PatientWorkorderAttachmentInstance extends Instance<PatientWorkorderAttachmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientWorkorderAttachmentAttributes;
}
