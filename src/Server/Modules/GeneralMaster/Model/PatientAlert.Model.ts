import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAlertInstance, i.PatientAlertAttributes> {
    let PatientAlert = sequelize.define<i.PatientAlertInstance, i.PatientAlertAttributes>('PatientAlert', {
        Id: { type: DataTypes.BIGINT, field: 'PatientAlertId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        AlertTypeId: { type: DataTypes.BIGINT, field: 'AlertTypeId' },
        SeverityId: { type: DataTypes.BIGINT, field: 'SeverityId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        OnsetDate: { type: DataTypes.DATE, field: 'OnsetDate' },
        ClosureDate: { type: DataTypes.DATE, field: 'ClosureDate' },
        AlertDescription: { type: DataTypes.STRING, field: 'AlertDescription' },
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
            tableName: 'patientalerts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientAlert as any).associate = function (models: Models) {
        PatientAlert.belongsTo(models.Department);
                    PatientAlert.belongsTo(models.ReferenceValue, { as: 'AlertType', targetKey: 'ReferenceValueCodeId' });
                    PatientAlert.belongsTo(models.ReferenceValue, { as: 'Severity', targetKey: 'ReferenceValueCodeId' });
                    PatientAlert.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
                    PatientAlert.belongsTo(models.User, { foreignKey: 'CreatedBy' });
                };
 return PatientAlert;
}
