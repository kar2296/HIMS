import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ImmunizationInstance, i.ImmunizationAttributes> {
    let Immunization = sequelize.define<i.ImmunizationInstance, i.ImmunizationAttributes>('Immunization', {
        Id: { type: DataTypes.BIGINT, field: 'ImmunizationId', primaryKey: true, autoIncrement: true },
        ImmunizationName: { type: DataTypes.STRING, field: 'ImmunizationName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Instruction: { type: DataTypes.STRING, field: 'Instruction' },
        FrequencyId: { type: DataTypes.BIGINT, field: 'FrequencyId' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        PeriodId: { type: DataTypes.BIGINT, field: 'PeriodId' },
        ConditionId: { type: DataTypes.BIGINT, field: 'ConditionId' },
        RouteId: { type: DataTypes.BIGINT, field: 'RouteId' },
        ScheduleFlagId: { type: DataTypes.BIGINT, field: 'ScheduleFlagId' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'immunizations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Immunization as any).associate = function(models: Models) {
                    Immunization.belongsTo(models.ReferenceValue, { as: 'Frequency', targetKey: 'ReferenceValueCodeId' });
                    Immunization.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Immunization;
}
