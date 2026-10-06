import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientGeneralHistoryInstance, i.PatientGeneralHistoryAttributes> {
    let PatientGeneralHistory = sequelize.define<i.PatientGeneralHistoryInstance, i.
        PatientGeneralHistoryAttributes>('PatientGeneralHistory', {
            Id: { type: DataTypes.BIGINT, field: 'GeneralHistoryId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            CaptureDate: { type: DataTypes.DATE, field: 'CaptureDate' },
            GeneralHistory: { type: DataTypes.STRING, field: 'GeneralHistory' },
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
            tableName: 'patientgeneralhistory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (PatientGeneralHistory as any).associate = function (models: Models) {
    //     PatientGeneralHistory.belongsTo(models.ReferenceValue, { as: 'SocialType', targetKey: 'ReferenceValueCodeId' });
    //     PatientGeneralHistory.belongsTo(models.ReferenceValue, { as: 'SocialFrequency', targetKey: 'ReferenceValueCodeId' });
    //     PatientGeneralHistory.belongsTo(models.ReferenceValue, { as: 'Severity', targetKey: 'ReferenceValueCodeId' });
    //     PatientGeneralHistory.belongsTo(models.ReferenceValue,
    //         { as: 'SocialHistoryStatus', targetKey: 'ReferenceValueCodeId' });
    // };
    return PatientGeneralHistory;
}
