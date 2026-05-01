import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientAnnotationAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    AnnotationTypeId: number;
    Comments: string;
    PerformedDate: Date;
    PerformedBy: number;
    AnnotationStatusId: number;
    FilePath: string;
    IsPHR: boolean;
    Annotations: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAnnotationInstance extends Instance<PatientAnnotationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAnnotationAttributes;
}
