import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RevenueTargetInstance, i.RevenueTargetAttributes> {
    let RevenueTarget = sequelize.define<i.RevenueTargetInstance, i.RevenueTargetAttributes>('RevenueTarget', {
        Id: { type: DataTypes.BIGINT, field: 'RevenueTargetId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        YearId: { type: DataTypes.BIGINT, field: 'YearId' },
        MonthId: { type: DataTypes.BIGINT, field: 'MonthId' },
        RevenueTarget: { type: DataTypes.STRING, field: 'RevenueTarget' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_revenuetarget',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (RevenueTarget as any).associate = function (models: Models) {
        RevenueTarget.belongsTo(models.ReferenceValue, {
            as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId', foreignKey: 'ActiveStatusId'
        });
        RevenueTarget.belongsTo(models.ReferenceValue, {
            as: 'FinancialYear', targetKey: 'ReferenceValueCodeId', foreignKey: 'YearId'
        });
        RevenueTarget.belongsTo(models.ReferenceValue, {
            as: 'Month', targetKey: 'ReferenceValueCodeId', foreignKey: 'MonthId'
        });
    };
    return RevenueTarget;
}
