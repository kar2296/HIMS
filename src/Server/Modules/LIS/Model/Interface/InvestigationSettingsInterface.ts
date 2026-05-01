import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface InvestigationSettingsAttributes extends IAttributes {
    Id: number;
    LabOrderWithBilling: boolean;
    LabOrderWithoutBilling: boolean;
    LabSampleCollection: boolean;
    LabSampleReview: boolean;
    LabWorksheetGeneration: boolean;
    LabResultEntry: boolean;
    LabResultEntryAbove: boolean;
    LabResultApproval: boolean;
    LabResultAuthenticate: boolean;
    OtherOrderWithBilling: boolean;
    OtherOrderWithoutBilling: boolean;
    OtherWorksheetGeneration: boolean;
    OtherResultEntry: boolean;
    OtherResultEntryAbove: boolean;
    OtherResultApproval: boolean;
    OtherResultAuthenticate: boolean;
    OtherResultRecvfrmPACS: boolean;
    RadioOrderWithBilling: boolean;
    RadioOrderWithoutBilling: boolean;
    RadioWorksheetGeneration: boolean;
    RadioResultEntry: boolean;
    RadioResultEntryAbove: boolean;
    RadioResultApproval: boolean;
    RadioResultAuthenticate: boolean;
    RadioResultRecvfrmPACS: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface InvestigationSettingsInstance extends Instance<InvestigationSettingsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: InvestigationSettingsAttributes;
}
