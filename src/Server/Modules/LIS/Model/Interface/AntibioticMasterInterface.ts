import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AntibioticMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Code: string;
    AntibioticName: string;
    Mnemonic: string;
    DisplayOrder: string;
    AntibioticTypeId: number;
    OrganismId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AntibioticMasterInstance extends Instance<AntibioticMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AntibioticMasterAttributes;
}
