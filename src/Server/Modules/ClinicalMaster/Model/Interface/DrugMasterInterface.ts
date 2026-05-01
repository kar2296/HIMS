import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DrugMasterAttributes extends IAttributes {
    Id: number;
    DrugTypeId: number;
    DrugCode: string;
    DrugName: string;
    Description: string;
    GenericId: number;
    GenericCode: string;
    GenericName: string;
    DrugTradeId: number;
    DrugFormId: number;
    DrugFrequencyId: number;
    Duration: string;
    DurationPeriodId: number;
    DrugInstructionId: number;
    Advice: String;
    DrugRouteId: number;
    MaxDosagePerDay: string;
    IsEssentialDrug: boolean;
    IsFormulary: boolean;
    DrugGroupId: number;
    DrugSubGroupId: number;
    IsDosageNotApplicable: boolean;
    IsSpecialApprovalRequired: boolean;
    IsDrugDatabaseAlert: boolean;
    IsOrderWithoutPrescription: boolean;
    IsCalculateFrequencyQty: boolean;
    IsCrushable: boolean;
    IsNotUseForIP: boolean;
    IsAllowToOrder: boolean;
    IsBottleType: boolean;
    AuthenticationLevelId: number;
    LogoPath: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    TallmanContent: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DrugMasterInstance extends Instance<DrugMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrugMasterAttributes;
}
