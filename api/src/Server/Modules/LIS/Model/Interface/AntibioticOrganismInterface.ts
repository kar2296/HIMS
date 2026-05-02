import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AntibioticOrganismMapAttributes extends IAttributes {
    Id: number;
    AntibioticMasterId: number;
    OrganismMapId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AntibioticOrganismMapInstance extends Instance<AntibioticOrganismMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AntibioticOrganismMapAttributes;
}
