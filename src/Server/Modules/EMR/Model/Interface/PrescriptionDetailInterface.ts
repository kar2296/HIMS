import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PrescriptionDetailAttributes extends IAttributes {
    Id: number;
    PrescriptionId: number;
    DrugId: number;
    DrugCode: string;
    DrugName: string;
    IsGeneric: boolean;
    GenericId: number;
    DrugGenericId: number;
    DrugGenericCode: string;
    DrugGenericName: string;
    DrugFrequencyId: number;
    PrecriptionStatusId: number;
    DrugRouteId: number;
    Dosage: string;
    Duration: number;
    DurationPeriodId: number;
    Quantity: number;
    DispensedQuantity: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    RxName: string;
    AdminInstructions: string;
    PharmacyId: number;
    StartDate: Date;
    Diagnosis: string;
    Price: number;
    SpecialApprovalId: number;
    Notes: string;
    DrugFormId: number;
    DrugFormName: string;
    NoOfRefills: number;
    PrescriptionPriorityId: number;
    GuarantorId: number;
    EndDate: Date;
    SubstitutionAllowedId: number;
    TaperingOrderId: number;
    RefusetoBuyId: number;
    DrugInstructionId: number;
    SearchTypeId: number;
    STAT: boolean;
    Morning: number;
    Noon: number;
    Night: number;
    AdministeredQuantity: number;
    AdministerStatusId: number;
    IseMAR: boolean;
}

export interface PrescriptionDetailInstance extends Instance<PrescriptionDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PrescriptionDetailAttributes;
}

