import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientFollowupAttributes extends IAttributes {
    Id: number;
    FollowupCode:string;
    FollowupName:string;
    FollowupTypeId: number;
    FollowupStatusId: number;
    DoctorId:number;
    DepartmentId:number;
    UnitId:number;
    PatientId:number;
    EncounterId:number;
    EncounterTypeId:number;
    FirstFollowupDate:Date;
    FirstComments:string;
    FirstAdmitedDate:Date;
    SecondFollowupDate:Date;
    SecondComments:string;
    SecondAdmitedDate:Date;
    ThirdFollowupDate:Date;
    ThirdComments:string;
    ThirdAdmitedDate:Date;
    DoctorName:string;
    RecomendedProcedure:string;
    OrganizationId:number;
    FacilityId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientFollowupInstance extends Instance<PatientFollowupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientFollowupAttributes;
}
