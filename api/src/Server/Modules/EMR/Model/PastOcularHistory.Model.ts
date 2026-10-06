import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PastOcularHistoryInstance, i.PastOcularHistoryAttributes> {
    let PastOcularHistory = sequelize.define<i.PastOcularHistoryInstance, i.
        PastOcularHistoryAttributes>('PastOcularHistory', {
            Id: { type: DataTypes.BIGINT, field: 'PastOcularHistoryId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PreviousEyeProblems: { type: DataTypes.STRING, field: 'PreviousEyeProblems' },
            RefractiveErrorId: { type: DataTypes.BIGINT, field: 'RefractiveErrorId' },
            OcularSurgery: { type: DataTypes.STRING, field: 'OcularSurgery' },
            OcularTrauma: { type: DataTypes.STRING, field: 'OcularTrauma' },
            LazyEye: { type: DataTypes.STRING, field: 'LazyEye' },
            Others: { type: DataTypes.STRING, field: 'Others' },
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
            tableName: 'pastocularhistory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (PastOcularHistory as any).associate = function (models: Models) {
    //     PastOcularHistory.belongsTo(models.ChiefComplaint, { foreignKey: 'SymptomId' });
    // };
    return PastOcularHistory;
}
