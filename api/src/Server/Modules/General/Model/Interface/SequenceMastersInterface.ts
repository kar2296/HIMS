import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface SequenceMastersAttributes extends IAttributes {
    Id: number;
    SeqName:string;
    TableName: string;
    OrganizationId: number;
    FacilityId: number;
    SeqPrefix: string;
    SeqSuffix: string;
    SeqStartId: number;
    SeqLastId: number;
    SeqBaseId: number;
    IsDailyReset: boolean;
    SeqIncSize: number;
    SeqBlockSize: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    IdFormat: string;
    Timestamp: Date;
    ReseedInterval: number;
    LastReseedDate: Date;
    CollectionId: number;
    OwnerOrganisationId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SequenceMastersInstance extends Instance<SequenceMastersAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SequenceMastersAttributes;
}
