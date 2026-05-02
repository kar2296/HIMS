import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FitnessCertificateAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientName: string;
    DoctorId: number;
    TemplateTypeId: number;
    NoteTemplateId: string;
    DataTemplate: string;
    CertificateStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FitnessCertificateInstance extends Instance<FitnessCertificateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FitnessCertificateAttributes;
}
