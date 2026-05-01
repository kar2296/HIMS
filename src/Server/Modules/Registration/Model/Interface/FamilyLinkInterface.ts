import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface FamilyLinkAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    MemberId: number;
    PatientName: string;
    Age: number;
    Gender: string;
    MRN: string;
    RelationshipId: boolean;
    NationalId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FamilyLinkInstance extends Instance<FamilyLinkAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FamilyLinkAttributes;
}
