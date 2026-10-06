import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DiagnosisAttributes extends IAttributes {
    Id: number;
    DiagnosisCodeSchemeId: number;
    Code: string;
    DiagnosisName: string;
    Description: string;
    DiagnosisVersionId: number;
    CodeRegionId: number;
    FacilityId: number;
    Speciality: string;
    Synonym: string;
    SideId: number;
    TestMasterPositionId: number;
    ReferrenceLink: string;
    LengthOfStay: string;
    BodySite: string;
    IsActive: boolean;
    IsNotifibale: boolean;
    IsSensitive: boolean;
    IsBillable: boolean;
    Comments: string;
    ActiveStatusId: number;
    CategoryId: number;
    TypeId: number;
    DepartmentId: number;
    GradeId: number;
    AgeFrom: number;
    AgeTo: number;
    GenderId: number;
    EncounterTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DiagnosisInstance extends Instance<DiagnosisAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DiagnosisAttributes;
}
