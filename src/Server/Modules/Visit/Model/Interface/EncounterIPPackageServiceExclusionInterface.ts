import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EncounterIPPackageServiceExclusionAttributes extends IAttributes {
    Id: number;
    EncounterIPPackageDetailId: number;
    PatientBillDetailId: number;
    IPPackageServiceExclusionId: number;
    ServiceCategoryId: number;
    ServiceItemId: number;
    ServiceItemName: string;
    Quantity: number;
    Rate: number;
    Amount: number;
    TotalAmount: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EncounterIPPackageServiceExclusionInstance extends Instance<EncounterIPPackageServiceExclusionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterIPPackageServiceExclusionAttributes;
}
