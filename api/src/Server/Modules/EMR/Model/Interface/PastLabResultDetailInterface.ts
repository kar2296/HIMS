import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PastLabResultDetailAttributes extends IAttributes {
    Id: number;
    ClinicalResultId: number;
    Orderdetailid: number;
    Orderid: number;
    Encounterorderid: number;
    PatientId: number;
    EncounterId: number;
    TestId: number;
    TestName: string;
    TestCode: string;
    Name: string;
    Analyteid: number;
    Analytename: string;
    Analyterange: string;
    Reference: string;
    Qualifier: string;
    Resultvalue: string;
    AnalyteUOM: string;
    Methodology: string;
    TestValueType: string;
    WorkOrderDetailStatusId: number;
    AcceptedDate: Date;
    Departmentid: number;
    Subdepartmentid: number;
    Sampleid: number;
    Samplecollectiondate: Date;
    SpecReceiveddate: Date;
    Performedondate: Date;
    Uom: string;
    TechValidationId: number;
    TechValidationName: string;
    TechValidationdate: Date;
    MedValidationById: number;
    MedValidationByName: string;
    MedValidationdate: Date;
    ReleasedBy: string;
    ReleasedDate: Date;
    ReleaseToPatientId: number;
    SampleTypeId: number;
    QualifierId: number;
    AnalyteDisplayOrder: number;
    TestDisplayOrder: number;
    ProfileName: string;
    TESTMASTERTYPId: number;
    AnalyteCode: string;
    ProfileDisplayOrder: number;
    RootProfileDisplayOrder: number;
    RootProfileName: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PastLabResultDetailInstance extends Instance<PastLabResultDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PastLabResultDetailAttributes;
}
