import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface InvestigationSettingsAttributes extends IAttributes {
    Id: number;
    // Per-facility configuration
    FacilityId?: number;
    // ── Lab Workflow Modes ───────────────────────────────────────────────────
    LabOrderWithBilling: boolean;
    LabOrderWithoutBilling: boolean;
    LabSampleCollection: boolean;
    LabSampleReview: boolean;
    LabWorksheetGeneration: boolean;
    LabResultEntry: boolean;
    LabResultEntryAbove: boolean;
    LabResultApproval: boolean;
    LabResultAuthenticate: boolean;
    // ── Other (Microbiology / Misc) Workflow Modes ───────────────────────────
    OtherOrderWithBilling: boolean;
    OtherOrderWithoutBilling: boolean;
    OtherWorksheetGeneration: boolean;
    OtherResultEntry: boolean;
    OtherResultEntryAbove: boolean;
    OtherResultApproval: boolean;
    OtherResultAuthenticate: boolean;
    OtherResultRecvfrmPACS: boolean;
    // ── Radiology Workflow Modes ─────────────────────────────────────────────
    RadioOrderWithBilling: boolean;
    RadioOrderWithoutBilling: boolean;
    RadioWorksheetGeneration: boolean;
    RadioResultEntry: boolean;
    RadioResultEntryAbove: boolean;
    RadioResultApproval: boolean;
    RadioResultAuthenticate: boolean;
    RadioResultRecvfrmPACS: boolean;
    // ── LIS Interface Modes ──────────────────────────────────────────────────
    /** Master switch — enable analyser result auto-posting via LIS interface */
    LabLISInterfaceEnabled: boolean;
    /** 0 = Disabled | 1 = Unidirectional (push from analyser) | 2 = Bidirectional */
    LabLISMode: number;
    /** Auto-accept LIS results into workorder without manual review */
    LabAutoResultAccept: boolean;
    /** Enable PACS/RIS auto-result posting for Radiology */
    RadioRISInterfaceEnabled: boolean;
    /** Auto-accept RIS results without manual review */
    RadioAutoResultAccept: boolean;
    // ── Additional Lab Workflow Flags ────────────────────────────────────────
    /** Sample rejection workflow with rejection reason */
    LabSampleRejection: boolean;
    /** Print barcode label on sample acceptance */
    LabBarcodePrint: boolean;
    /** Allow repeat/recheck test from approval screen */
    LabResultRecheck: boolean;
    /** Explicit result-release step before patient can view report */
    LabResultRelease: boolean;
    /** Send critical-value notification to nursing/doctor */
    LabCriticalValueAlert: boolean;
    /** Allow forwarding orders to external reference labs */
    LabExternalLabEnabled: boolean;
    /** Enable culture sensitivity organism isolation sub-module */
    LabMicrobiologyEnabled: boolean;
    /** Enable microbiology department fully */
    MicrobiologyEnabled: boolean;
    /** Enable STAT/URGENT/ROUTINE priority tagging */
    LabOrderPriority: boolean;
    /** Require patient consent before certain tests */
    LabConsentRequired: boolean;
    // ── TAT Alert Settings ───────────────────────────────────────────────────
    /** Enable TAT breach notifications */
    LabTATAlertEnabled: boolean;
    /** TAT threshold in minutes before alert fires */
    LabTATAlertMinutes: number;
    // ── Audit ────────────────────────────────────────────────────────────────
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
