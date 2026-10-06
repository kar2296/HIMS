import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientToothChartAttributes extends IAttributes {
    Id: number;
    ToothChartTypeId: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    ToothChartDatetime: Date;
    ToothImgId: string;
    Implant: string;
    Crack: string;
    PerioSurgery: string;
    MissingTooth: string;
    Crown: string;
    Braces: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientToothChartInstance extends Instance<PatientToothChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientToothChartAttributes;
}
