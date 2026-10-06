import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VitalMasterAttributes extends IAttributes {
    Id: number;
    VitalName: string;
    UOM: string;
    GraphTypeId: number;
    VitalValueTypeId: number;
    LoincCode: string;
    Description: string;
    ReferrenceLink: string;
    ValueFormat: string;
    ReferenceRangeFrom: string;
    ReferenceRangeTo: string;
    Mnemonic: string;
    IsActive: boolean;
    ActiveStatusId: number;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VitalMasterInstance extends Instance<VitalMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VitalMasterAttributes;
}
