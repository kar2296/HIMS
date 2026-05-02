import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LISInterfacePatientDetailsAttributes extends IAttributes {
   Id: number;
    OrganizationId?: number;
    FacilityId?: number;
    AssetId?: number;
    Sampleid?: string;
    PatientId?: number;           // This was missing - causing the error
    EncounterId?: number;
    Approved?: boolean;
    ApprovedById?: number;
    ApproveDt?: Date;
    Rejected?: boolean;
    RejectedById?: number;
    RejectedDt?: Date;
    FullResult?: string;
    Status?: number;
    Rev?: number;
    CreatedBy?: number;
    CreatedAt?: Date;
    UpdatedBy?: number;
    UpdatedAt?: Date;
}

export interface LISInterfacePatientDetailsInstance extends Instance<LISInterfacePatientDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LISInterfacePatientDetailsAttributes;
}
