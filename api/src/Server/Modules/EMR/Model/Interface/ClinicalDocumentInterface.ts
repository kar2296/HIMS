import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ClinicalDocumentAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    ReleaseToPatientId: number;
    Name: string;
    DocumentTypeId: number;
    ReleaseToPatient: number;
    FilePath: string;
    Comments: string;
    WorkOrderId:number;
    CreatedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ClinicalDocumentInstance extends Instance<ClinicalDocumentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClinicalDocumentAttributes;
}
