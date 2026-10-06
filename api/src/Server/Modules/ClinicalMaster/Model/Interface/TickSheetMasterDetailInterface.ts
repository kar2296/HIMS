import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TickSheetMasterDetailAttributes extends IAttributes {
    Id: number;
    TickSheetMasterId: number;
    ItemId: number;
    ItemName: string;
    GroupName: string;
    DisplayOrder: number;
    TickSheetMasterTypeId: number;
    DrugName: string;
    DrugCode: string;
    Dosage: string;
    Duration: number;
    Morning: string;
    Noon: string;
    Night: string;
    Notes: string;
    DurationPeriodId: number;
    DrugInstructionId: number;
    Quantity: number;
    TestName: string;
    TestCode: string;
    TestTypeId: number;
    IsDirectBill: boolean;
    ServiceId: number;
    ServiceCode: string;
    ServiceName: string;
    ServiceCategoryId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TickSheetMasterDetailInstance extends Instance<TickSheetMasterDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TickSheetMasterDetailAttributes;
}
