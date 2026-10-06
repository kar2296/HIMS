import { IAttributes } from '../../../Base';
import { Instance } from '../../../../Core';

export interface EncounterMLCAttributes extends IAttributes {
  Id: number;
  EncounterId: number;
  PatientId: number;
  EscortTypeId: number;
  EscortUserId: number;
  EscortName: string;
  VeichleNo: string;
  MLCNo: string;
  IsMLC: boolean;
  AccidentTypeId: number;
  BriefOfAccident: string;
  IncidentDate: Date;
  IdentificationMark: string;
  DoctorId: number;
  MLCPatientStatus: number;
  PoliceStation: string;
  AddressOfAcident: string;
  CertificateNo: string;
  BuckleNo: string;
  PoliceCertificateDate: Date;
  AddressOfAcident2: string;
  PinCodeId: number;
  CityId: number;
  StateId: number;
  CountryId: number;
  ConsultationId: number;
  MLCStatusId: number;
  ContactNo: string;
  Reflink: string;
  Status: number;
  Rev: number;
  CreatedBy: number;
  CreatedAt: Date;
  UpdatedBy: number;
  UpdatedAt: Date;
}

export interface EncounterMLCInstance extends Instance<EncounterMLCAttributes> {
  // I'm exposing every DB column as an instance field to so that tsc won't complain.
  // CreatedAt: Date;
  // UpdatedAt: Date;
  dataValues: EncounterMLCAttributes;
}
