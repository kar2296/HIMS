import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientBPChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    BPChartDate: Date;
    BPChartTime: string;
    BPPulseRate:string;
    PPPulseRate: string;
    MAPPulseRate: string;
    RightArmBPSupine: string;
    LeftArmBPSupine: string;
    RightArmBPSitting: string;
    LeftArmBPSitting: string;
    RightArmBPStanding: number;
    LeftArmBPStanding: string;
    RightArmPPSupine: string;
    LeftArmPPSupine: string;
    RightArmPPSitting: string;
    LeftArmPPSitting: string;
    RightArmPPStanding: number;
    LeftArmPPStanding: string;
    RightArmMAPSupine: string;
    LeftArmMAPSupine: string;
    RightArmMAPSitting: string;
    LeftArmMAPSitting: string;
    RightArmMAPStanding: number;
    LeftArmMAPStanding: string;
    Signatory: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientBPChartInstance extends Instance<PatientBPChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientBPChartAttributes;
}
