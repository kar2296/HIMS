import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProcedureAttributes extends IAttributes {
    Id: number;
    ProcedureCodeSchemeId: number;
    Code: string;
    ProcedureName: string;
    Description: string;
    ProcedureVersionId: number;
    FacilityId: number;
    CodeRegionId: number;
    Speciality: string;
    Equipments: string;
    ReferrenceLink: string;
    BodySite: string;
    ProcedureTypeId: number;
    ProcedureOperationTypeId: number;
    Duration: string;
    ProcedureCategoryId: number;
    ProcedureSubCategoryId: number;
    AnaesthesiaTypeId: number;
    IsActive: boolean;
    IsBillable: boolean;
    IsFreeText: boolean;
    IsCathlabProcedures: boolean;
    ActiveStatusId: number;
    TechniqueId: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProcedureInstance extends Instance<ProcedureAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProcedureAttributes;
}
