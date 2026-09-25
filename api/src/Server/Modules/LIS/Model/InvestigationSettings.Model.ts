import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InvestigationSettingsInstance, i.InvestigationSettingsAttributes> {
    let InvestigationSettings =
        sequelize.define<i.InvestigationSettingsInstance, i.InvestigationSettingsAttributes>('InvestigationSettings', {
            Id: { type: DataTypes.BIGINT, field: 'InvtsettingsId', primaryKey: true, autoIncrement: true },
            // Per-facility config
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', allowNull: true },
            // ── Lab Workflow Modes ────────────────────────────────────────────
            LabOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'LabOrderWithBilling' },
            LabOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'LabOrderWithoutBilling' },
            LabSampleCollection: { type: DataTypes.BOOLEAN, field: 'LabSampleCollection' },
            LabSampleReview: { type: DataTypes.BOOLEAN, field: 'LabSampleReview' },
            LabWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'LabWorksheetGeneration' },
            LabResultEntry: { type: DataTypes.BOOLEAN, field: 'LabResultEntry' },
            LabResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'LabResultEntryAbove' },
            LabResultApproval: { type: DataTypes.BOOLEAN, field: 'LabResultApproval' },
            LabResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'LabResultAuthenticate' },
            // ── Other Workflow Modes ──────────────────────────────────────────
            OtherOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'OtherOrderWithBilling' },
            OtherOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'OtherOrderWithoutBilling' },
            OtherWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'OtherWorksheetGeneration' },
            OtherResultEntry: { type: DataTypes.BOOLEAN, field: 'OtherResultEntry' },
            OtherResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'OtherResultEntryAbove' },
            OtherResultApproval: { type: DataTypes.BOOLEAN, field: 'OtherResultApproval' },
            OtherResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'OtherResultAuthenticate' },
            OtherResultRecvfrmPACS: { type: DataTypes.BOOLEAN, field: 'OtherResultRecvfrmPACS' },
            // ── Radiology Workflow Modes ──────────────────────────────────────
            RadioOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'RadioOrderWithBilling' },
            RadioOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'RadioOrderWithoutBilling' },
            RadioWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'RadioWorksheetGeneration' },
            RadioResultEntry: { type: DataTypes.BOOLEAN, field: 'RadioResultEntry' },
            RadioResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'RadioResultEntryAbove' },
            RadioResultApproval: { type: DataTypes.BOOLEAN, field: 'RadioResultApproval' },
            RadioResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'RadioResultAuthenticate' },
            RadioResultRecvfrmPACS: { type: DataTypes.BOOLEAN, field: 'RadioResultRecvfrmPACS' },
            // ── LIS Interface Modes ───────────────────────────────────────────
            LabLISInterfaceEnabled: { type: DataTypes.BOOLEAN, field: 'LabLISInterfaceEnabled', defaultValue: false },
            LabLISMode: { type: DataTypes.TINYINT, field: 'LabLISMode', defaultValue: 0 },
            LabAutoResultAccept: { type: DataTypes.BOOLEAN, field: 'LabAutoResultAccept', defaultValue: false },
            RadioRISInterfaceEnabled: { type: DataTypes.BOOLEAN, field: 'RadioRISInterfaceEnabled', defaultValue: false },
            RadioAutoResultAccept: { type: DataTypes.BOOLEAN, field: 'RadioAutoResultAccept', defaultValue: false },
            // ── Additional Lab Workflow Flags ─────────────────────────────────
            LabSampleRejection: { type: DataTypes.BOOLEAN, field: 'LabSampleRejection', defaultValue: false },
            LabBarcodePrint: { type: DataTypes.BOOLEAN, field: 'LabBarcodePrint', defaultValue: true },
            LabResultRecheck: { type: DataTypes.BOOLEAN, field: 'LabResultRecheck', defaultValue: false },
            LabResultRelease: { type: DataTypes.BOOLEAN, field: 'LabResultRelease', defaultValue: false },
            LabCriticalValueAlert: { type: DataTypes.BOOLEAN, field: 'LabCriticalValueAlert', defaultValue: true },
            LabExternalLabEnabled: { type: DataTypes.BOOLEAN, field: 'LabExternalLabEnabled', defaultValue: false },
            LabMicrobiologyEnabled: { type: DataTypes.BOOLEAN, field: 'LabMicrobiologyEnabled', defaultValue: false },
            MicrobiologyEnabled: { type: DataTypes.BOOLEAN, field: 'MicrobiologyEnabled', defaultValue: false },
            LabOrderPriority: { type: DataTypes.BOOLEAN, field: 'LabOrderPriority', defaultValue: false },
            LabConsentRequired: { type: DataTypes.BOOLEAN, field: 'LabConsentRequired', defaultValue: false },
            // ── TAT Alert Settings ────────────────────────────────────────────
            LabTATAlertEnabled: { type: DataTypes.BOOLEAN, field: 'LabTATAlertEnabled', defaultValue: false },
            LabTATAlertMinutes: { type: DataTypes.INTEGER, field: 'LabTATAlertMinutes', defaultValue: 60 },
            // ── Audit ─────────────────────────────────────────────────────────
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        } as any,

            {
                indexes: [],
                timestamps: true,
                tableName: 'investigationsettings',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });



    return InvestigationSettings;
}
