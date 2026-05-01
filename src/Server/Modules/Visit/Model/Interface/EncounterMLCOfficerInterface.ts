import { IAttributes } from '../../../Base';
import { Instance } from '../../../../Core';

export interface EncounterMLCOfficerAttributes extends IAttributes {
  Id: number;
  EncounterId: number;
  PatientId: number;
  EncounterMLCId: number;
  OfficerName: string;
  Designation: string;
  ContactNo: string;
  Status: number;
  Rev: number;
  CreatedBy: number;
  CreatedAt: Date;
  UpdatedBy: number;
  UpdatedAt: Date;
}

export interface EncounterMLCOfficerInstance extends Instance<EncounterMLCOfficerAttributes> {
  // I'm exposing every DB column as an instance field to so that tsc won't complain.
  // CreatedAt: Date;
  // UpdatedAt: Date;
  dataValues: EncounterMLCOfficerAttributes;
}
