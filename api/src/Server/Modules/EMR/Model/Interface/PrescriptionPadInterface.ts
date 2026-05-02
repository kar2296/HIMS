import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PrescriptionPadAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    DoctorId: number;
    PrescribedOn:Date;
    PrescriptionTypeId:number;
    PrescriptionSheet: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PrescriptionPadInstance extends Instance<PrescriptionPadAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PrescriptionPadAttributes;
}
