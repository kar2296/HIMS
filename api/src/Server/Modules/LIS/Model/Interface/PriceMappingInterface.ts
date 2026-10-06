import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PriceMappingAttributes extends IAttributes {
    Id: number;
    ExternalProviderId: number;
    TestId: number;
    TestCode:string;
    TestName:string;
    TESTMASTERTYPId: number;
    UCP: string;
    AliasCode: number;
    AliasName: number;
    ProviderName: number;
    Name: string;
    ResultReleaseDate: Date;
    ActiveFrom: Date;
    ActiveTo: Date;
    Comments: string;
    OtherCost: number;
    Price: number;
    ActiveStatusId: number;
    IsAttachementRequired: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PriceMappingInstance extends Instance<PriceMappingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PriceMappingAttributes;
}
