import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SampletypeAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    Code: string;
    Description: string;
    Name: string;
    Mnemonics: string;
    SAMPLETYPId: number;
    Volume: number;
    SampleUnitsId: number;
    StorageInst: string;
    OtherInst: string;
    ExpDys: number;
    CollectionSiteId: number;
    CollectionMethodId: number;
    CollectionRouteId: number;
    ContainerTypeId: number;
    Reflink: string;
    Reason: string;
    Ext_DID: string;
    GENERICINDId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsActive: boolean;
    IsMicro: boolean;
    ActiveStatusId: number;
    SampleTypeId : number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SampletypeInstance extends Instance<SampletypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SampletypeAttributes;
}
