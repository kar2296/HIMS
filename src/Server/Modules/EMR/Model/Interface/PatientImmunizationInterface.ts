import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientImmunizationAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ImmunizationId: number;
    ImmunizationName: string;
    Description: string;
    ImmunizationTypeId: number;
    CVXCode: string;
	  RouteId: number;
    UOM: string;
    AgeFrom: number;
    AgeTo: number;
    TotalDosageCount: number;
    ImmunizationStatusId: number;
    ImmunizationAdministrationTypeId: number;
    AdministeredById: number;
    AdministeredBy: string;
   Location: string;
    ManufacturerId: number;
    ManufacturerName: string;
    LotNumber: string;
    ExpiryDate: Date;
    Comments: string;
    PerformedDate: Date;
    PerformedBy: number;
    PatientImmunizationScheduleId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientImmunizationInstance extends Instance<PatientImmunizationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientImmunizationAttributes;
}
