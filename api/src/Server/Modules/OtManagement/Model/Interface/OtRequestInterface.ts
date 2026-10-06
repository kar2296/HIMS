import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OtRequestAttributes extends IAttributes {
    Id: number;
    OTRequestTypeId: number;
    OTrequestNo: string;
    OTRequestedOn: Date;
    PatientId: number;
    EncounterId: number;
    ProcedureId: number;
    DoctorId: number;
    OtTechnicianId: string;
    ScurbNurseId: string;
    Startdate: Date;
    Enddate: Date;
    StartTime: string;
    EndTime: string;
    OTRoomId: number;
    SurgeryCategoryId: number;
    AnaesthesiaTypeId: number;
    SurgeryTypeId: number;
    SurgeryId: number;
    SurgeryName: string;
    AdditionalSurgeryId: number;
    AdditionalSurgeryName: string;
    ChiefSurgeonId: number;
    AssociateSurgeonId: number;
    OtherSurgeon: string;
    AssistantSurgeonId: number;
    AnaesthesistId: number;
    Equipments: string;
    Instruments: string;
    OTRequestStatusId: number;
    DepartmentId:number;
    RemarksId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface OtRequestInstance extends Instance<OtRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtRequestAttributes;
}
