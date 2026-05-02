import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InvestigationSettingsInstance, i.InvestigationSettingsAttributes> {
    let InvestigationSettings =
        sequelize.define<i.InvestigationSettingsInstance, i.InvestigationSettingsAttributes>('InvestigationSettings', {
            Id: { type: DataTypes.BIGINT, field: 'InvtsettingsId', primaryKey: true, autoIncrement: true },
            LabOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'LabOrderWithBilling' },
            LabOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'LabOrderWithoutBilling' },
            LabSampleCollection: { type: DataTypes.BOOLEAN, field: 'LabSampleCollection' },
            LabSampleReview: { type: DataTypes.BOOLEAN, field: 'LabSampleReview' },
            LabWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'LabWorksheetGeneration' },
            LabResultEntry: { type: DataTypes.BOOLEAN, field: 'LabResultEntry' },
            LabResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'LabResultEntryAbove' },
            LabResultApproval: { type: DataTypes.BOOLEAN, field: 'LabResultApproval' },
            LabResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'LabResultAuthenticate' },
            OtherOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'OtherOrderWithBilling' },
            OtherOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'OtherOrderWithoutBilling' },
            OtherWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'OtherWorksheetGeneration' },
            OtherResultEntry: { type: DataTypes.BOOLEAN, field: 'OtherResultEntry' },
            OtherResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'OtherResultEntryAbove' },
            OtherResultApproval: { type: DataTypes.BOOLEAN, field: 'OtherResultApproval' },
            OtherResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'OtherResultAuthenticate' },
            OtherResultRecvfrmPACS: { type: DataTypes.BOOLEAN, field: 'OtherResultRecvfrmPACS' },
            RadioOrderWithBilling: { type: DataTypes.BOOLEAN, field: 'RadioOrderWithBilling' },
            RadioOrderWithoutBilling: { type: DataTypes.BOOLEAN, field: 'RadioOrderWithoutBilling' },
            RadioWorksheetGeneration: { type: DataTypes.BOOLEAN, field: 'RadioWorksheetGeneration' },
            RadioResultEntry: { type: DataTypes.BOOLEAN, field: 'RadioResultEntry' },
            RadioResultEntryAbove: { type: DataTypes.BOOLEAN, field: 'RadioResultEntryAbove' },
            RadioResultApproval: { type: DataTypes.BOOLEAN, field: 'RadioResultApproval' },
            RadioResultAuthenticate: { type: DataTypes.BOOLEAN, field: 'RadioResultAuthenticate' },
            RadioResultRecvfrmPACS: { type: DataTypes.BOOLEAN, field: 'RadioResultRecvfrmPACS' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
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
