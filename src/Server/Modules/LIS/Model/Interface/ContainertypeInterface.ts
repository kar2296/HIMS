import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ContainertypeAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    Code: string;
    Mnemonics: string;
    Name: string;
    Description: string;
    CONTAINTYPId: number;
    COLORId: number;
    Height: number;
    HEIGHTUNITSId: number;
    Diameter: number;
    DIAMETERUNITSId: number;
    Minvolume: number;
    Maxvolume: number;
    Labeltype: number;
    Inst: string;
    Activefrom: Date;
    Activeto: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ContainertypeInstance extends Instance<ContainertypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ContainertypeAttributes;
}
