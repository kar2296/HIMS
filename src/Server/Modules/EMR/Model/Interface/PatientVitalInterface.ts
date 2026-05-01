import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientVitalAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    VitalId: number;
    VitalValue: string;
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
    Comments: string;
    EncounterTypeId:number;
    PatientVitalStatusId: number;
    VitalQualifier: string;
    VitalQualifierId: number;
    GroupId: number;
    PerformedDate: Date;
    PerformedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientVitalInstance extends Instance<PatientVitalAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientVitalAttributes;
}
