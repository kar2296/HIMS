import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ExternalprovidersAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    ExternalprovidersId: number;
    TestmasterId: number;
    AliasCode: string;
    AliasName: string;
    UCP: string;
    ResultReleaseDate: Date;
    IsAttachementRequired: number;
    Comments: string;
    OtherCost: string;
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

export interface ExternalprovidersInstance extends Instance<ExternalprovidersAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ExternalprovidersAttributes;
}
