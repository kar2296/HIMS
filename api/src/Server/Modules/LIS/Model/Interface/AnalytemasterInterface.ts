import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AnalytemasterAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    AnalyteTypeId: number;
    Code: string;
    Description: string;
    Name: string;
    AnalyteuomId: string;
    Mnemonics: string;
    Valuetype_e: number;
    Listofvalue: string;
    Formula: string;
    Displayorder: number;
    Printorder: number;
    Excludefromprint: number;
    Loinccode: string;
    Loincname: string;
    Component: string;
    Methodology: string;
    SampletypeId: number;
    Graphtype_e: number;
    Referencelink: string;
    Observation: string;
    Activefrom: Date;
    Activeto: Date;
    IsActive: boolean;
    IsWrapResult: boolean;
    ActiveStatusId: number;
    IsTemplates: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsExcelUpload: boolean;
}

export interface AnalytemasterInstance extends Instance<AnalytemasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalytemasterAttributes;
}
