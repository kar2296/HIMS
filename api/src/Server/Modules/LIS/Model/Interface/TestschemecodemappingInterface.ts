import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TestschemecodemappingAttributes extends IAttributes {
    Id: number;
    IdentifyingId: number;
    Identifyingtype: string;
    Testschemecodename_e: number;
    Term: string;
    SchemecodeId: number;
    Schemecodename: string;
    Version: string;
    Activefrom: Date;
    Activeto: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TestschemecodemappingInstance extends Instance<TestschemecodemappingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestschemecodemappingAttributes;
}
