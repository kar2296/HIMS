import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TemplateMasterDetailAttributes extends IAttributes {
    Id: number;
    TemplateMasterId: number;
    TemplateTypeId: number;
    ItemId: number;
    DrugGenericId: number;
    DrugGenericName: string;
    DisplayName: string;
    DrugName: string;
    DrugCode: string;
    Dosage: string;
    Duration: number;
    Morning: string;
    Noon: string;
    Night: string;
    DurationPeriodId: number;
    DrugInstructionId: number;
    Notes:string;
    Quantity: number;
    TestName: string;
    TestCode: string;
    TestTypeId: number;
    IsDirectBill: boolean;
    Comments: string;
    IsActive: boolean;
    ServiceCode: string;
    ServiceName: string;
    TestInstruction: string;
    ClinicalData: string;
    ServiceCategoryId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TemplateMasterDetailInstance extends Instance<TemplateMasterDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TemplateMasterDetailAttributes;
}
