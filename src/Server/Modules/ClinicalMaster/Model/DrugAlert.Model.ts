import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DrugAlertInstance, i.DrugAlertAttributes> {
    let DrugAlert = sequelize.define<i.DrugAlertInstance, i.DrugAlertAttributes>('DrugAlert', {
        Id: { type: DataTypes.BIGINT, field: 'DrugAlertId', primaryKey: true, autoIncrement: true },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        DrugAlertTypeId: { type: DataTypes.BIGINT, field: 'DrugAlertTypeId' },
        AlertMinValue: { type: DataTypes.STRING, field: 'AlertMinValue' },
        AlertMaxValue: { type: DataTypes.STRING, field: 'AlertMaxValue' },
        DrugAgeGroupId: { type: DataTypes.BIGINT, field: 'DrugAgeGroupId' },
        Alerts: { type: DataTypes.STRING, field: 'Alerts' },
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
            tableName: 'drugalerts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DrugAlert as any).associate = function(models: Models) {
                    DrugAlert.belongsTo(models.ReferenceValue, { as: 'DrugAlertType', targetKey: 'ReferenceValueCodeId' });
                    DrugAlert.belongsTo(models.ReferenceValue, { as: 'DrugAgeGroup', targetKey: 'ReferenceValueCodeId' });
                };
 return DrugAlert;
}
