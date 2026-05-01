import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PreOperativeChecklistInstance, i.PreOperativeChecklistAttributes> {
    let PreOperativeChecklist = sequelize.define<i.PreOperativeChecklistInstance,
        i.PreOperativeChecklistAttributes>('PreOperativeChecklist', {
            Id: { type: DataTypes.BIGINT, field: 'PreOperativeChecklistId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            CheckListTypeId: { type: DataTypes.BIGINT, field: 'CheckListTypeId' },
            CheckListOn: { type: DataTypes.DATE, field: 'CheckListOn' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            ReviewedBy: { type: DataTypes.INTEGER, field: 'ReviewedBy' },
            ReviewedOn: { type: DataTypes.DATE, field: 'ReviewedOn' },
            PatientSignature: { type: DataTypes.STRING, field: 'PatientSignature' },
            SignPath: { type: DataTypes.STRING, field: 'SignPath' },
            PreOperativeChecklistStatusId: { type: DataTypes.BIGINT, field: 'PreOperativeChecklistStatusId' },
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
                tableName: 'preoperativechecklist',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PreOperativeChecklist as any).associate = function (models: Models) {
        PreOperativeChecklist.belongsTo(models.User, { foreignKey: 'CreatedBy' });
        PreOperativeChecklist.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PreOperativeChecklist.belongsTo(models.ReferenceValue,
            { as: 'CheckListType', targetKey: 'ReferenceValueCodeId' });
        PreOperativeChecklist.belongsTo(models.ReferenceValue,
            { as: 'PreOperativeChecklistStatus', targetKey: 'ReferenceValueCodeId' });
        PreOperativeChecklist.hasMany(models.PreOperativeChecklistDetails);
    };
    return PreOperativeChecklist;
}
